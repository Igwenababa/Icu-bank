
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Recipient, Transaction, Account, SecuritySettings, View, TransactionStatus, AccountType, UserProfile } from '../types.ts';
import { STANDARD_FEE, EXPRESS_FEE, EXCHANGE_RATES, TRANSFER_PURPOSES, USER_PIN, NETWORK_AUTH_CODE } from '../constants.ts';
import { SpinnerIcon, CheckCircleIcon, ShieldCheckIcon, XIcon, NetworkIcon, UsersIcon, SendIcon, CameraIcon, CalendarDaysIcon, ArrowPathIcon, ExclamationTriangleIcon, GlobeAmericasIcon, LockClosedIcon, WalletIcon, ServerIcon, WifiIcon } from './Icons.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { PaymentReceipt } from './PaymentReceipt.tsx';
import { CheckDepositFlow } from './CheckDepositFlow.tsx';
import { RecipientSelector } from './RecipientSelector.tsx';
import { sendSmsNotification, generateTransactionReceiptSms } from '../services/notificationService.ts';
import { ComplianceHaltModal } from './ComplianceHaltModal.tsx';


interface SendMoneyFlowProps {
  recipients: Recipient[];
  accounts: Account[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>) => Promise<Transaction | null>;
  transactions: Transaction[];
  securitySettings: SecuritySettings;
  hapticsEnabled: boolean;
  onAuthorizeTransaction: (transactionId: string, method: 'code' | 'fee') => void;
  setActiveView: (view: View) => void;
  onClose: () => void;
  onLinkAccount: () => void;
  onDepositCheck: (details: { amount: number, accountId: string, images: { front: string, back: string } }) => void;
  onSplitTransaction: (details: { sourceAccountId: string; splits: { recipient: Recipient; amount: number }[]; totalAmount: number; purpose: string; }) => boolean;
  initialTab?: 'send' | 'split' | 'deposit';
  transactionToRepeat?: Transaction | null;
  userProfile: UserProfile;
  onContactSupport: () => void;
}

const TABS = [
    { id: 'send', label: 'Global Transfer', icon: <GlobeAmericasIcon className="w-4 h-4 mr-2" /> },
    { id: 'split', label: 'Split Bill', icon: <UsersIcon className="w-4 h-4 mr-2" /> },
    { id: 'deposit', label: 'Mobile Deposit', icon: <CameraIcon className="w-4 h-4 mr-2" /> },
];

const FREQUENCIES = [
    { id: 'one-time', label: 'One-time Execution' },
    { id: 'weekly', label: 'Weekly Standing Order' },
    { id: 'bi-weekly', label: 'Bi-Weekly Standing Order' },
    { id: 'monthly', label: 'Monthly Standing Order' },
];

const NetworkHandshake: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [logIndex, setLogIndex] = useState(0);
    
    const logs = [
        "Initializing Secure Handshake...",
        "Resolving Host: secure.swift.network...",
        "Establishing TLS 1.3 Tunnel...",
        "Verifying Digital Signatures...",
        "Encrypting Transaction Payload...",
        "Broadcasting to Settlement Layer...",
        "Awaiting Network Acknowledgement..."
    ];

    useEffect(() => {
        // Progress Bar Animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(onComplete, 800); // Small delay before completion
                    return 100;
                }
                // Variable speed for realism
                const increment = Math.random() * 3 + 1;
                return Math.min(prev + increment, 100);
            });
        }, 100);

        // Log rotation
        const logInterval = setInterval(() => {
            setLogIndex(prev => Math.min(prev + 1, logs.length - 1));
        }, 800);

        return () => {
            clearInterval(progressInterval);
            clearInterval(logInterval);
        };
    }, [onComplete]);

    return (
        <div className="text-center py-10 animate-fade-in">
            {/* Central Circular Progress */}
            <div className="relative w-40 h-40 mx-auto mb-8">
                 {/* Outer Ring */}
                 <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                 {/* Spinning Gradient Ring */}
                 <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" style={{ animationDuration: '1.5s' }}></div>
                 
                 {/* Inner Circle with Data */}
                 <div className="absolute inset-2 bg-slate-900 rounded-full flex flex-col items-center justify-center shadow-inner border border-white/5">
                    <ServerIcon className="w-8 h-8 text-slate-500 mb-1 animate-pulse" />
                    <span className="text-3xl font-bold text-white font-mono">{Math.floor(progress)}%</span>
                    <span className="text-[10px] text-primary font-bold tracking-widest uppercase mt-1">Uploading</span>
                 </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Connecting to Network</h3>
            <p className="text-slate-400 text-sm mb-8">Please do not close this window or refresh.</p>
            
            {/* Terminal Log View */}
            <div className="max-w-sm mx-auto bg-black/40 rounded-lg p-4 border border-white/5 text-left font-mono text-xs h-24 overflow-hidden flex flex-col justify-end shadow-inner">
                {logs.slice(0, logIndex + 1).slice(-3).map((log, i) => (
                    <div key={i} className="text-green-400/90 mb-1 truncate">
                        <span className="text-slate-600 mr-2">{`>`}</span>
                        {log}
                    </div>
                ))}
                <div className="animate-pulse text-primary">_</div>
            </div>
        </div>
    );
};


// Main Component
export const SendMoneyFlow: React.FC<SendMoneyFlowProps> = ({ recipients, accounts, createTransaction, transactions, securitySettings, hapticsEnabled, onAuthorizeTransaction, setActiveView, onClose, onLinkAccount, onDepositCheck, onSplitTransaction, initialTab, transactionToRepeat, userProfile, onContactSupport }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'split' | 'deposit'>(initialTab || 'send');
  const [step, setStep] = useState(0); // 0: Details, 1: Review, 2: Authorize, 3: SecurityCheck, 4: Complete
  const [isRecipientSelectorOpen, setIsRecipientSelectorOpen] = useState(false);

  // Calculate internal and external accounts
  const { internalAccounts, externalAccounts } = useMemo(() => {
    const internal = accounts.filter(acc => acc.type !== AccountType.EXTERNAL_LINKED);
    const external = accounts.filter(acc => acc.type === AccountType.EXTERNAL_LINKED);
    return { internalAccounts: internal, externalAccounts: external };
  }, [accounts]);
  
  // Form State (Single Send)
  const [sourceAccountId, setSourceAccountId] = useState<string>(() => (internalAccounts.length > 0 ? internalAccounts[0].id : ''));
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(recipients.length > 0 ? recipients[0] : null);
  const [sendAmount, setSendAmount] = useState('');
  const [purpose, setPurpose] = useState(TRANSFER_PURPOSES[0]);
  const [deliverySpeed, setDeliverySpeed] = useState<'Standard' | 'Express'>('Standard');
  const [receiveCurrency, setReceiveCurrency] = useState<string>(selectedRecipient?.country.currency || 'GBP');
  const [rateLockCountdown, setRateLockCountdown] = useState(60);
  
  // Recurring / Schedule State
  const [frequency, setFrequency] = useState('one-time');
  const [scheduledDate, setScheduledDate] = useState('');

  // Security State
  const [pin, setPin] = useState('');
  const [networkAuthCode, setNetworkAuthCode] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNetworkHandshakeActive, setIsNetworkHandshakeActive] = useState(false);
  
  // Strict Compliance State
  const [showComplianceHalt, setShowComplianceHalt] = useState(false);

  // Legal Consents State
  const [consents, setConsents] = useState({
      accuracy: false,
      auth: false,
      aml: false
  });

  // Transaction State
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null);
  
  const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);

  // Single Send calculations
  const fee = deliverySpeed === 'Express' ? EXPRESS_FEE : STANDARD_FEE;
  const numericSendAmount = parseFloat(sendAmount) || 0;
  const exchangeRate = EXCHANGE_RATES[receiveCurrency] || 0;
  const receiveAmount = numericSendAmount * exchangeRate;
  const totalCost = numericSendAmount + fee;
  
  const amountError = useMemo(() => {
    if (numericSendAmount < 0) return "Amount cannot be negative.";
    if (numericSendAmount > 0 && !sourceAccount) return "Source account not found.";
    // Bypass balance check for external accounts
    if (sourceAccount && sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
      if (numericSendAmount > 0 && totalCost > sourceAccount.balance) {
          return `Insufficient funds. Available: ${sourceAccount.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
      }
    }
    return null;
  }, [numericSendAmount, totalCost, sourceAccount]);
  
  const isDetailsInvalid = amountError !== null || numericSendAmount <= 0 || !selectedRecipient || !sourceAccount;

  const liveTransaction = useMemo(() => {
    if (!createdTransaction) return null;
    return transactions.find(t => t.id === createdTransaction.id) || createdTransaction;
  }, [transactions, createdTransaction]);

  const hapticTrigger = useCallback(() => {
    if(hapticsEnabled) triggerHaptic();
  }, [hapticsEnabled]);

  const handleNextStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev + 1);
  }, [hapticTrigger]);

  const handlePrevStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev - 1);
    setError(''); // Clear errors when going back
  }, [hapticTrigger]);

  const handleSourceAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'link_new_account') {
      onLinkAccount();
    } else {
      setSourceAccountId(value);
    }
  };

  useEffect(() => {
    if (selectedRecipient) {
      setReceiveCurrency(selectedRecipient.country.currency);
    }
  }, [selectedRecipient]);

  // For auto-selecting new external account
  const prevAccountsLength = useRef(accounts.length);
  useEffect(() => {
    if (accounts.length > prevAccountsLength.current) {
        const newAccount = accounts[accounts.length - 1];
        if (newAccount.type === AccountType.EXTERNAL_LINKED) {
            setSourceAccountId(newAccount.id);
        }
    }
    prevAccountsLength.current = accounts.length;
  }, [accounts]);

  useEffect(() => {
    if (step === 1 && rateLockCountdown > 0) {
        const timer = setInterval(() => setRateLockCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    } else if (step !== 1) {
        setRateLockCountdown(60); // Reset timer when leaving review step
    }
  }, [step, rateLockCountdown]);

  useEffect(() => {
    if (transactionToRepeat) {
        const fullRecipient = recipients.find(r => r.id === transactionToRepeat.recipient.id);

        setActiveTab('send');
        setStep(0);
        setSourceAccountId(transactionToRepeat.accountId);
        setSelectedRecipient(fullRecipient || transactionToRepeat.recipient);
        setSendAmount(String(transactionToRepeat.sendAmount));
        setPurpose(transactionToRepeat.purpose || TRANSFER_PURPOSES[0]);
        setDeliverySpeed(transactionToRepeat.deliverySpeed || 'Standard');
        
        // Reset other state
        setCreatedTransaction(null);
        setFrequency('one-time');
        setScheduledDate('');
        setConsents({ accuracy: false, auth: false, aml: false });
    }
  }, [transactionToRepeat, recipients]);
  
  const handlePinSubmit = async () => {
    setError('');
    if (pin !== USER_PIN) {
        setError('Authentication Failed. Invalid PIN.');
        return;
    }
    setIsProcessing(true);
    
    // Enhance description for recurring/scheduled transfers
    let finalDescription = purpose;
    if (frequency !== 'one-time') {
        finalDescription = `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Transfer: ${purpose}`;
    } else if (scheduledDate) {
        finalDescription = `Scheduled Transfer (${scheduledDate}): ${purpose}`;
    }

    const estimatedArrivalDate = scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 86400000 * 3);
    // If scheduled in future, add appropriate days
    if (scheduledDate) {
        estimatedArrivalDate.setDate(estimatedArrivalDate.getDate() + 3);
    }

    const newTransaction = await createTransaction({
      accountId: sourceAccount!.id,
      recipient: selectedRecipient!,
      sendAmount: numericSendAmount,
      receiveAmount: receiveAmount,
      receiveCurrency: receiveCurrency,
      fee: fee,
      exchangeRate: exchangeRate,
      deliverySpeed: deliverySpeed,
      purpose: purpose,
      description: finalDescription,
    });

    if (newTransaction) {
      setCreatedTransaction(newTransaction);
      // Artificial delay to simulate local processing
      setTimeout(() => {
          handleNextStep(); // Move to security check
          setIsProcessing(false);
      }, 1000);
    } else {
        setError('Transaction initiation failed. Please verify connection.');
        setIsProcessing(false);
    }
  };

  // Replaces standard check with strict compliance + visual handshake
  const handleSecurityCheckTrigger = () => {
      setError('');
      if (networkAuthCode !== NETWORK_AUTH_CODE) {
          setError('Network authorization code rejected.');
          return;
      }
      
      // Start the Visual Handshake
      setIsNetworkHandshakeActive(true);
  };

  // Called by the NetworkHandshake component when it finishes 100%
  const handleHandshakeComplete = () => {
      setIsNetworkHandshakeActive(false);
      // Immediately trigger compliance halt
      setShowComplianceHalt(true);
  };

  const finalizeTransaction = () => {
      setShowComplianceHalt(false);
      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          handleNextStep(); // Move to final completion step (Receipt)
      }, 1000);
  };
  
  const resetFlow = () => {
      setStep(0);
      setCreatedTransaction(null);
      setSendAmount('');
      setPin('');
      setNetworkAuthCode('');
      setError('');
      setFrequency('one-time');
      setScheduledDate('');
      setConsents({ accuracy: false, auth: false, aml: false });
      setIsNetworkHandshakeActive(false);
  };

  const totalSteps = 5; // Details, Review, Authorize, Security, Complete
  const progress = Math.min(((step + 1) / totalSteps) * 100, 100);

  return (
    <>
        {/* Strict Compliance Halt Modal */}
        {showComplianceHalt && (
            <ComplianceHaltModal
                isOpen={showComplianceHalt}
                amount={numericSendAmount}
                onVerified={finalizeTransaction}
                onCancel={() => setShowComplianceHalt(false)}
            />
        )}

        {/* Main Modal Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Background Backdrop with Image */}
            <div className="absolute inset-0 bg-slate-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            </div>

            {/* Glassmorphic Card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                
                {/* Secure Header */}
                <div className="flex-shrink-0 p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-full border border-primary/30">
                            <LockClosedIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">Secure Transaction</h2>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">Encrypted Connection Active</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-6 pb-0">
                    <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'send' | 'split' | 'deposit')}
                                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Progress Indicator */}
                {activeTab === 'send' && (
                    <div className="px-8 mt-6 mb-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                            <span className={step >= 0 ? 'text-primary' : ''}>Details</span>
                            <span className={step >= 1 ? 'text-primary' : ''}>Review</span>
                            <span className={step >= 2 ? 'text-primary' : ''}>Auth</span>
                            <span className={step >= 3 ? 'text-primary' : ''}>Network</span>
                            <span className={step >= 4 ? 'text-primary' : ''}>Receipt</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary-600 to-cyan-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                
                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                {activeTab === 'send' && (
                    <>
                    {step === 0 && ( // Details
                        <div className="space-y-6 animate-fade-in-up">
                            {/* Amount Card */}
                            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 text-center relative group hover:bg-slate-800/70 transition-colors">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Transfer Amount</label>
                                <div className="relative inline-block">
                                    <span className="absolute left-[-20px] top-2 text-2xl text-slate-500">$</span>
                                    <input 
                                        type="number" 
                                        value={sendAmount} 
                                        onChange={e => setSendAmount(e.target.value)} 
                                        className="bg-transparent text-5xl sm:text-6xl font-bold text-white text-center outline-none w-full max-w-[300px] placeholder-slate-700"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                                <div className="mt-2 text-sm text-slate-400 font-medium">
                                    Available Balance: {sourceAccount?.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </div>
                                {amountError && <div className="absolute bottom-2 left-0 right-0 text-red-400 text-xs font-bold">{amountError}</div>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Source */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">From Account</label>
                                    <div className="relative">
                                        <select value={sourceAccountId} onChange={handleSourceAccountChange} className="w-full bg-slate-950/50 border border-white/10 text-white p-4 rounded-xl appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium">
                                            {internalAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname} (....{acc.accountNumber.slice(-4)})</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ArrowPathIcon className="w-4 h-4 transform rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Recipient */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">To Beneficiary</label>
                                    <button onClick={() => setIsRecipientSelectorOpen(true)} className="w-full flex items-center justify-between bg-slate-950/50 border border-white/10 text-white p-4 rounded-xl hover:bg-slate-900/80 transition-all group">
                                        {selectedRecipient ? (
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                    {selectedRecipient.fullName.charAt(0)}
                                                </div>
                                                <div className="text-left truncate">
                                                    <p className="font-bold text-sm truncate">{selectedRecipient.nickname || selectedRecipient.fullName}</p>
                                                    <p className="text-xs text-slate-400 truncate">{selectedRecipient.bankName}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 font-medium">Select Recipient</span>
                                        )}
                                        <ArrowPathIcon className="w-4 h-4 text-slate-500 transform -rotate-90 group-hover:text-primary transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Settings Grid */}
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <CalendarDaysIcon className="w-4 h-4 text-primary" /> Execution Date
                                    </label>
                                    <input 
                                        type="date" 
                                        value={scheduledDate} 
                                        onChange={e => setScheduledDate(e.target.value)} 
                                        className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <ArrowPathIcon className="w-4 h-4 text-primary" /> Frequency
                                    </label>
                                    <select 
                                        value={frequency} 
                                        onChange={e => setFrequency(e.target.value)} 
                                        className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary"
                                    >
                                        {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <WalletIcon className="w-4 h-4 text-primary" /> Purpose
                                    </label>
                                    <select value={purpose} onChange={e => setPurpose(e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary max-w-[150px]">
                                        {TRANSFER_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && ( // Review with Legal Consents
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white">Review Transaction</h3>
                                <p className="text-slate-400 text-sm">Please confirm the details below before authorizing.</p>
                            </div>

                            <div className="bg-slate-100 text-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                                {/* Receipt Holes */}
                                <div className="absolute top-0 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIwIiByPSI4IiBmaWxsPSIjMGYxNzJhIi8+PC9zdmc+')] bg-repeat-x opacity-100"></div>
                                
                                <div className="flex justify-between items-end border-b border-slate-300 pb-4 mb-4">
                                    <div>
                                        <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Total Debit</p>
                                        <p className="text-3xl font-mono font-bold text-slate-900">{totalCost.toLocaleString('en-US',{style:'currency', currency:'USD'})}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Recipient Gets</p>
                                        <p className="text-xl font-mono font-bold text-green-600">{receiveAmount.toLocaleString('en-US',{style:'currency', currency:receiveCurrency})}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Principal Amount</span>
                                        <span className="font-semibold">{numericSendAmount.toLocaleString('en-US',{style:'currency', currency:'USD'})}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Processing Fee ({deliverySpeed})</span>
                                        <span className="font-semibold">{fee.toLocaleString('en-US',{style:'currency', currency:'USD'})}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Live Exchange Rate</span>
                                        <span className="font-semibold flex items-center gap-1">
                                            1 USD = {exchangeRate.toFixed(4)} {receiveCurrency}
                                            <span className="flex h-2 w-2 relative ml-1">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-3 bg-slate-200 rounded-lg text-xs text-slate-600 flex justify-between items-center">
                                    <span>Rate Lock Active</span>
                                    <span className="font-mono font-bold text-red-500">{rateLockCountdown}s remaining</span>
                                </div>
                            </div>

                            {/* Professional Consents */}
                            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4 text-yellow-500">
                                    <ExclamationTriangleIcon className="w-5 h-5" />
                                    <h4 className="font-bold text-sm uppercase tracking-wider">Legal Declarations</h4>
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={consents.accuracy} onChange={e => setConsents({...consents, accuracy: e.target.checked})} className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-500 bg-slate-900/50 checked:border-primary checked:bg-primary transition-all" />
                                            <CheckCircleIcon className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
                                        </div>
                                        <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">I certify that the recipient details provided are accurate and the funds are from a legitimate source.</span>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={consents.auth} onChange={e => setConsents({...consents, auth: e.target.checked})} className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-500 bg-slate-900/50 checked:border-primary checked:bg-primary transition-all" />
                                            <CheckCircleIcon className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
                                        </div>
                                        <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">I authorize iCredit Union to debit my account for the total amount detailed above.</span>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={consents.aml} onChange={e => setConsents({...consents, aml: e.target.checked})} className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-500 bg-slate-900/50 checked:border-primary checked:bg-primary transition-all" />
                                            <CheckCircleIcon className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
                                        </div>
                                        <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">I confirm this transaction complies with international AML (Anti-Money Laundering) regulations.</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && ( // Authorize (PIN)
                        <div className="text-center animate-fade-in-up py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 ring-1 ring-primary/30 shadow-[0_0_30px_rgba(0,82,255,0.15)]">
                                <ShieldCheckIcon className="w-10 h-10 text-primary"/>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Biometric Authorization</h3>
                            <p className="text-sm text-slate-400 mt-2 mb-8">Enter your 4-digit secure PIN to sign this transaction.</p>
                            
                            <div className="max-w-xs mx-auto">
                                <input 
                                    type="password" 
                                    value={pin} 
                                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))} 
                                    maxLength={4} 
                                    className="w-full bg-black/50 border border-white/20 text-center text-4xl tracking-[1em] rounded-2xl p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner placeholder-slate-700" 
                                    placeholder="••••" 
                                    autoFocus 
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm mt-4 bg-red-900/20 py-2 px-4 rounded-lg inline-block border border-red-500/20">{error}</p>}
                        </div>
                    )}

                    {step === 3 && ( // Security Check
                        isNetworkHandshakeActive ? (
                            <NetworkHandshake onComplete={handleHandshakeComplete} />
                        ) : (
                            <div className="text-center animate-fade-in-up py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 rounded-full mb-6 ring-1 ring-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
                                    <NetworkIcon className="w-10 h-10 text-indigo-400"/>
                                    <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-ping"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Network Handshake</h3>
                                <p className="text-sm text-slate-400 mt-2 mb-8">Establishing secure tunnel to Global Settlement Network...</p>
                                
                                <div className="max-w-xs mx-auto bg-slate-950 border border-slate-800 rounded-xl p-4 text-left">
                                    <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">Input Network Auth Code</label>
                                    <input 
                                        type="text" 
                                        value={networkAuthCode} 
                                        onChange={e => setNetworkAuthCode(e.target.value.toUpperCase())} 
                                        maxLength={20} 
                                        className="w-full bg-transparent border-b border-slate-700 text-center text-lg tracking-widest text-green-400 focus:outline-none focus:border-green-500 font-mono" 
                                        placeholder="NET-..." 
                                        autoFocus 
                                    />
                                </div>
                                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                            </div>
                        )
                    )}

                    {step === 4 && createdTransaction && (
                        <PaymentReceipt
                            transaction={liveTransaction!}
                            sourceAccount={sourceAccount!}
                            onStartOver={resetFlow}
                            onViewActivity={() => { onClose(); setActiveView('history'); }}
                            onAuthorizeTransaction={onAuthorizeTransaction}
                            phone={userProfile.phone}
                            onContactSupport={onContactSupport}
                            accounts={accounts}
                        />
                    )}
                    </>
                )}
                
                {activeTab === 'deposit' && (
                    <CheckDepositFlow accounts={accounts} onDepositCheck={onDepositCheck} />
                )}
                </div>
            
                {/* Footer Actions */}
                {step < 4 && activeTab === 'send' && !isNetworkHandshakeActive && (
                    <div className="p-6 border-t border-white/10 bg-slate-900/50 backdrop-blur-md flex justify-between items-center">
                        <button 
                            onClick={handlePrevStep} 
                            disabled={step === 0 || isProcessing} 
                            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            Back
                        </button>
                        
                        {step === 0 && (
                            <button onClick={handleNextStep} disabled={isDetailsInvalid} className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                Review Transfer
                            </button>
                        )}
                        {step === 1 && (
                            <button onClick={handleNextStep} disabled={!consents.accuracy || !consents.auth || !consents.aml} className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:bg-slate-700">
                                Authorize Payment
                            </button>
                        )}
                        {step === 2 && (
                            <button onClick={handlePinSubmit} disabled={isProcessing || pin.length !== 4} className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 w-40 justify-center">
                                {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : <span>Sign & Send</span>}
                            </button>
                        )}
                        {step === 3 && (
                            <button onClick={handleSecurityCheckTrigger} disabled={isProcessing || networkAuthCode.length < 5} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 w-40 justify-center">
                                {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : <span>Verify</span>}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Recipient Selector Modal */}
        {isRecipientSelectorOpen && (
            <RecipientSelector 
                recipients={recipients} 
                onSelect={(r) => { setSelectedRecipient(r); setIsRecipientSelectorOpen(false); }} 
                onClose={() => setIsRecipientSelectorOpen(false)} 
            />
        )}
    </>
  );
};
