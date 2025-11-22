
import React, { useState, useMemo, useEffect } from 'react';
import { Account, Recipient, Country, Transaction, AdvancedTransferLimits } from '../types.ts';
import { DOMESTIC_WIRE_FEE, INTERNATIONAL_WIRE_FEE, TRANSFER_PURPOSES, USER_PIN, EXCHANGE_RATES, ALL_COUNTRIES } from '../constants.ts';
import { 
    CurrencyDollarIcon, UserCircleIcon, BankIcon, CheckCircleIcon, 
    XIcon, InfoIcon, UserGroupIcon, ShieldCheckIcon, DocumentCheckIcon, ExclamationTriangleIcon, LockClosedIcon
} from './Icons.tsx';
import { CountrySelector } from './CountrySelector.tsx';
import { BankSelector } from './BankSelector.tsx';
import { RecipientSelector } from './RecipientSelector.tsx';
import { ComplianceHaltModal } from './ComplianceHaltModal.tsx';

interface WireTransferProps {
    accounts: Account[];
    recipients: Recipient[];
    onSendWire: (data: any) => Promise<Transaction | null>;
    onClose: () => void;
    initialData?: {
        bankName?: string;
        step?: number;
        recipientCountry?: Country;
    } | null;
    advancedTransferLimits: AdvancedTransferLimits;
    addRecipient: (data: any) => void;
}

const stepsConfig = [
    { label: 'Details', icon: <CurrencyDollarIcon className="w-6 h-6" /> },
    { label: 'Recipient', icon: <UserCircleIcon className="w-6 h-6" /> },
    { label: 'Bank Info', icon: <BankIcon className="w-6 h-6" /> },
    { label: 'Legal Review', icon: <DocumentCheckIcon className="w-6 h-6" /> },
    { label: 'Network', icon: <ShieldCheckIcon className="w-6 h-6" /> },
];

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex justify-between items-start mb-8 px-4">
        {stepsConfig.map((s, index) => (
            <React.Fragment key={s.label}>
                <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep > index ? 'bg-green-500 text-white' : currentStep === index ? 'bg-primary text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {currentStep > index ? <CheckCircleIcon className="w-7 h-7" /> : s.icon}
                    </div>
                    <p className={`mt-2 text-xs text-center font-medium ${currentStep >= index ? 'text-slate-200' : 'text-slate-400'}`}>{s.label}</p>
                </div>
                {index < stepsConfig.length - 1 && <div className={`flex-1 h-0.5 mt-6 transition-colors duration-300 mx-2 ${currentStep > index ? 'bg-green-500' : 'bg-slate-600'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);

const FieldSet: React.FC<{ legend: string, children: React.ReactNode, action?: React.ReactNode }> = ({ legend, children, action }) => (
    <fieldset className="p-4 border border-slate-600 rounded-lg bg-slate-800/20 relative">
        <div className="flex justify-between items-center mb-4">
            <legend className="font-bold px-2 text-slate-300">{legend}</legend>
            {action}
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </fieldset>
);

const Tooltip: React.FC<{ text: string }> = ({ text }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block ml-2">
            <button type="button" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="text-slate-400 hover:text-primary">
                <InfoIcon className="w-4 h-4" />
            </button>
            {show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-xs rounded-md p-2 shadow-lg z-10">{text}</div>}
        </div>
    );
};

const LimitDisplay: React.FC<{ label: string, value: number | 'Unlimited' }> = ({ label, value }) => (
    <div className="flex justify-between text-sm py-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-slate-200 font-mono">
            {typeof value === 'number' ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : value}
        </span>
    </div>
);

export const WireTransfer: React.FC<WireTransferProps> = ({ accounts, onSendWire, onClose, initialData, advancedTransferLimits, addRecipient, recipients }) => {
    const [step, setStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isBankSelectorOpen, setIsBankSelectorOpen] = useState(false);
    const [isRecipientSelectorOpen, setIsRecipientSelectorOpen] = useState(false);
    const [sentTransaction, setSentTransaction] = useState<Transaction | null>(null);
    const [pin, setPin] = useState('');
    const [saveRecipient, setSaveRecipient] = useState(true);
    
    // Professional Consents
    const [consents, setConsents] = useState({
        accuracy: false,
        auth: false,
        aml: false,
        irrevocable: false
    });

    // Compliance Halt State
    const [showComplianceHalt, setShowComplianceHalt] = useState(false);

    const [formData, setFormData] = useState({
        sourceAccountId: accounts.find(a => a.balance > 0)?.id || '',
        transferType: 'domestic',
        recipientCountry: ALL_COUNTRIES.find(c => c.code === 'US') as Country,
        recipientName: '',
        recipientAddress: '',
        recipientCity: '',
        recipientState: '',
        recipientPostalCode: '',
        bankName: '',
        bankAddress: '',
        accountNumber: '',
        swiftBic: '',
        routingNumber: '',
        intermediaryBank: '',
        amount: '',
        purpose: TRANSFER_PURPOSES[0],
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                bankName: initialData.bankName || prev.bankName,
                recipientCountry: initialData.recipientCountry || prev.recipientCountry,
                transferType: initialData.recipientCountry?.code !== 'US' ? 'international' : prev.transferType,
            }));
            if (initialData.step) {
                setStep(initialData.step);
            }
        }
    }, [initialData]);

    const fee = useMemo(() => formData.transferType === 'international' ? INTERNATIONAL_WIRE_FEE : DOMESTIC_WIRE_FEE, [formData.transferType]);
    const numericAmount = useMemo(() => parseFloat(formData.amount) || 0, [formData.amount]);
    const exchangeRate = useMemo(() => EXCHANGE_RATES[formData.recipientCountry.currency] || 1, [formData.recipientCountry]);
    const receiveAmount = useMemo(() => numericAmount * exchangeRate, [numericAmount, exchangeRate]);
    const totalCost = useMemo(() => numericAmount + fee, [numericAmount, fee]);
    const sourceAccount = useMemo(() => accounts.find(a => a.id === formData.sourceAccountId), [accounts, formData.sourceAccountId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
    };
    
    const handleCountryChange = (country: Country) => {
        setFormData(prev => ({...prev, recipientCountry: country, bankName: ''}));
    };

    const handleBankSelect = (bankName: string) => {
        setFormData(prev => ({ ...prev, bankName }));
        setIsBankSelectorOpen(false);
        if (errors.bankName) setErrors(prev => ({...prev, bankName: null}));
    };

    const handleRecipientSelect = (recipient: Recipient) => {
        const isInternational = recipient.country.code !== 'US';
        setFormData(prev => ({
            ...prev,
            recipientName: recipient.fullName,
            recipientAddress: recipient.streetAddress || '',
            recipientCity: recipient.city || '',
            recipientState: recipient.stateProvince || '',
            recipientPostalCode: recipient.postalCode || '',
            recipientCountry: recipient.country,
            bankName: recipient.bankName,
            accountNumber: recipient.realDetails.accountNumber,
            swiftBic: recipient.realDetails.swiftBic,
            routingNumber: isInternational ? '' : recipient.realDetails.swiftBic,
            transferType: isInternational ? 'international' : 'domestic',
        }));
        setIsRecipientSelectorOpen(false);
        setSaveRecipient(false); 
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let error: string | null = null;
        switch(name) {
            case 'routingNumber':
                if (formData.transferType === 'domestic' && !/^\d{9}$/.test(value)) {
                    error = "ABA Routing Number must be 9 digits.";
                }
                break;
            case 'swiftBic':
                if (formData.transferType === 'international' && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value)) {
                    error = "Invalid SWIFT/BIC format.";
                }
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };
    
    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string | null> = {};
        switch (currentStep) {
            case 0:
                if (!formData.sourceAccountId) newErrors.sourceAccountId = "Source account is required.";
                if (numericAmount <= 0) newErrors.amount = "Please enter a valid amount.";
                if (sourceAccount && totalCost > sourceAccount.balance) newErrors.amount = "Total cost exceeds account balance.";
                break;
            case 1:
                if (!formData.recipientName.trim()) newErrors.recipientName = "Recipient name is required.";
                if (!formData.recipientAddress.trim()) newErrors.recipientAddress = "Address is required.";
                if (!formData.recipientCity.trim()) newErrors.recipientCity = "City is required.";
                if (!formData.recipientPostalCode.trim()) newErrors.recipientPostalCode = "Postal code is required.";
                break;
            case 2:
                if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required.";
                if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required.";
                if (formData.transferType === 'domestic') {
                    if (!/^\d{9}$/.test(formData.routingNumber)) newErrors.routingNumber = "ABA Routing Number must be 9 digits.";
                } else {
                    if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(formData.swiftBic)) newErrors.swiftBic = "Invalid SWIFT/BIC format.";
                }
                break;
            case 3:
                 if (pin !== USER_PIN) newErrors.pin = "Incorrect PIN.";
                 if (!consents.accuracy || !consents.auth || !consents.aml || !consents.irrevocable) {
                     newErrors.consents = "You must acknowledge all legal consents.";
                 }
                 break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => setStep(prev => prev - 1);
    
    const handlePreSubmit = () => {
        if (validateStep(3)) {
            // CRITICAL: HALT FOR COMPLIANCE BEFORE SENDING TO NETWORK
            setShowComplianceHalt(true);
        }
    };

    const executeTransaction = async () => {
        setIsProcessing(true);
        setShowComplianceHalt(false); 

        const recipientForTx: Recipient = {
            id: `temp_${Date.now()}`,
            fullName: formData.recipientName,
            bankName: formData.bankName,
            accountNumber: `•••• ${formData.accountNumber.slice(-4)}`,
            country: formData.recipientCountry,
            deliveryOptions: { bankDeposit: true, cardDeposit: false, cashPickup: false },
            realDetails: {
                accountNumber: formData.accountNumber,
                swiftBic: formData.transferType === 'international' ? formData.swiftBic : formData.routingNumber,
            },
            streetAddress: formData.recipientAddress,
            city: formData.recipientCity,
            stateProvince: formData.recipientState,
            postalCode: formData.recipientPostalCode,
        };

        const txDetails = {
            accountId: formData.sourceAccountId,
            recipient: recipientForTx,
            sendAmount: numericAmount,
            receiveAmount: receiveAmount,
            receiveCurrency: formData.recipientCountry.currency,
            fee: fee,
            exchangeRate: exchangeRate,
            purpose: formData.purpose,
            description: `Wire Transfer to ${formData.recipientName}`,
            transferMethod: 'wire' as const,
        };
        
        const tx = await onSendWire(txDetails);

        if (tx) {
            setSentTransaction(tx);
            if (saveRecipient) {
                const recipientDataToSave = {
                    fullName: formData.recipientName,
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    swiftBic: formData.transferType === 'international' ? formData.swiftBic : formData.routingNumber,
                    country: formData.recipientCountry,
                    streetAddress: formData.recipientAddress,
                    city: formData.recipientCity,
                    stateProvince: formData.recipientState,
                    postalCode: formData.recipientPostalCode,
                    cashPickupEnabled: false,
                };
                addRecipient(recipientDataToSave);
            }
            setStep(4);
        } else {
            setErrors({ final: 'An unknown error occurred. Please try again.' });
            setStep(3);
        }
        setIsProcessing(false);
    };

    const inputClasses = (name: string) => `mt-1 w-full bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:bg-slate-700 focus:outline-none p-3 rounded-md transition-colors ${errors[name] ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-primary'}`;

    return (
        <>
            {/* STRICT ITCC COMPLIANCE HALT */}
            {showComplianceHalt && (
                <ComplianceHaltModal 
                    isOpen={showComplianceHalt}
                    amount={numericAmount}
                    onVerified={executeTransaction}
                    onCancel={() => setShowComplianceHalt(false)}
                />
            )}

            {isRecipientSelectorOpen && (
                <RecipientSelector 
                    recipients={recipients} 
                    onSelect={handleRecipientSelect} 
                    onClose={() => setIsRecipientSelectorOpen(false)} 
                />
            )}
            {isBankSelectorOpen && (
                <BankSelector 
                    countryCode={formData.recipientCountry.code}
                    onSelect={handleBankSelect}
                    onClose={() => setIsBankSelectorOpen(false)} 
                />
            )}
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="w-full max-w-4xl relative max-h-[95vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                    <div className="absolute inset-0 z-0">
                         <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out"
                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1639755294951-54117c2a5247?q=80&w=2832&auto=format&fit=crop')` }}
                        ></div>
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
                         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,82,255,0.1),transparent_70%)]"></div>
                    </div>
                    
                    <div className="relative z-10 p-8 flex-shrink-0">
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100"><XIcon className="w-6 h-6"/></button>
                        <h2 className="text-3xl font-bold text-slate-100 text-center mb-8">Advanced Wire Transfer</h2>
                        <StepIndicator currentStep={step} />
                    </div>

                    <div className="relative z-10 flex-grow overflow-y-auto px-8 pb-8">
                        {step === 0 && (
                             <div className="space-y-6 max-w-lg mx-auto animate-fade-in-up">
                                <FieldSet legend="Your Wire Limits">
                                    <LimitDisplay label="Per Transaction" value={advancedTransferLimits.wire.perTransaction || 'Unlimited'} />
                                    <LimitDisplay label="Daily Limit" value={advancedTransferLimits.wire.daily} />
                                    <LimitDisplay label="Monthly Limit" value={advancedTransferLimits.wire.monthly} />
                                </FieldSet>
                                <FieldSet legend="Transfer Details">
                                    <select name="sourceAccountId" value={formData.sourceAccountId} onChange={handleChange} className={inputClasses('sourceAccountId')}>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US',{style: 'currency', currency: 'USD'})})</option>)}
                                    </select>
                                    <div className="flex space-x-2 rounded-lg bg-slate-700/50 p-1">
                                        <button type="button" onClick={() => setFormData(p => ({...p, transferType: 'domestic'}))} className={`w-1/2 p-2 rounded-md font-semibold text-sm ${formData.transferType === 'domestic' ? 'bg-slate-900/70 text-white' : 'text-slate-300'}`}>Domestic</button>
                                        <button type="button" onClick={() => setFormData(p => ({...p, transferType: 'international'}))} className={`w-1/2 p-2 rounded-md font-semibold text-sm ${formData.transferType === 'international' ? 'bg-slate-900/70 text-white' : 'text-slate-300'}`}>International</button>
                                    </div>
                                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses('amount')} placeholder="Amount (USD)" />
                                    {errors.amount && <p className="text-red-400 text-xs">{errors.amount}</p>}
                                </FieldSet>
                                <FieldSet legend="Purpose of Transfer">
                                    <select name="purpose" value={formData.purpose} onChange={handleChange} className={inputClasses('purpose')}>
                                        {TRANSFER_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </FieldSet>
                            </div>
                        )}

                         {step === 1 && (
                            <div className="space-y-6 max-w-lg mx-auto animate-fade-in-up">
                                 <FieldSet legend="Recipient Information" action={
                                     <button onClick={() => setIsRecipientSelectorOpen(true)} className="text-xs font-medium text-primary-400 hover:text-primary-300 flex items-center space-x-1 bg-slate-900/50 px-3 py-1.5 rounded-md shadow-sm border border-slate-600 hover:border-primary-500 transition-colors">
                                         <UserGroupIcon className="w-3 h-3" />
                                         <span>Select from Contacts</span>
                                     </button>
                                 }>
                                    {formData.transferType === 'international' && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Recipient's Country</label>
                                            <CountrySelector selectedCountry={formData.recipientCountry} onSelect={handleCountryChange} className={`w-full flex items-center justify-between text-left mt-1 ${inputClasses('country')}`} />
                                        </div>
                                    )}
                                    <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} className={inputClasses('recipientName')} placeholder="Recipient Full Name" />
                                    <input type="text" name="recipientAddress" value={formData.recipientAddress} onChange={handleChange} className={inputClasses('recipientAddress')} placeholder="Street Address" />
                                    <div className="grid grid-cols-3 gap-4">
                                         <input type="text" name="recipientCity" value={formData.recipientCity} onChange={handleChange} className={`${inputClasses('recipientCity')} col-span-2`} placeholder="City" />
                                         <input type="text" name="recipientState" value={formData.recipientState} onChange={handleChange} className={inputClasses('recipientState')} placeholder="State" />
                                    </div>
                                    <input type="text" name="recipientPostalCode" value={formData.recipientPostalCode} onChange={handleChange} className={inputClasses('recipientPostalCode')} placeholder="Postal/ZIP Code" />
                                    <div className="flex justify-between items-center mt-4">
                                        <label htmlFor="save-recipient-toggle" className="text-sm font-medium text-slate-300">
                                            Save recipient for future use
                                        </label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" id="save-recipient-toggle" className="sr-only peer" checked={saveRecipient} onChange={(e) => setSaveRecipient(e.target.checked)} />
                                            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </FieldSet>
                             </div>
                        )}

                        {step === 2 && (
                             <div className="space-y-6 max-w-lg mx-auto animate-fade-in-up">
                                <FieldSet legend="Receiving Bank Information">
                                    <button type="button" onClick={() => setIsBankSelectorOpen(true)} className={`w-full text-left flex items-center justify-between ${inputClasses('bankName')}`}>
                                        <span className={formData.bankName ? '' : 'text-slate-400'}>{formData.bankName || 'Select bank...'}</span>
                                        <span>▼</span>
                                    </button>
                                     <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={inputClasses('accountNumber')} placeholder={formData.transferType === 'international' ? "IBAN / Account Number" : "Account Number"} />
                                    {formData.transferType === 'domestic' ? (
                                        <input type="text" name="routingNumber" value={formData.routingNumber} onChange={handleChange} onBlur={handleBlur} className={inputClasses('routingNumber')} placeholder="ABA Routing Number" />
                                    ) : (
                                        <input type="text" name="swiftBic" value={formData.swiftBic} onChange={handleChange} onBlur={handleBlur} className={inputClasses('swiftBic')} placeholder="SWIFT/BIC Code" />
                                    )}
                                    <div className="relative">
                                        <input type="text" name="intermediaryBank" value={formData.intermediaryBank} onChange={handleChange} className={`${inputClasses('intermediaryBank')} pr-10`} placeholder="Intermediary Bank (Optional)" />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center"><Tooltip text="An intermediary bank may be required for certain international transfers to route funds correctly. Check with the recipient's bank if you are unsure." /></div>
                                    </div>
                                </FieldSet>
                            </div>
                        )}

                         {step === 3 && (
                             <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
                                <div className="bg-slate-800/80 border border-slate-600 rounded-lg p-6 shadow-lg">
                                    <h3 className="text-lg font-bold text-white border-b border-slate-600 pb-3 mb-4">Transaction Summary</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                                        <p><strong>Amount:</strong> {numericAmount.toLocaleString('en-US',{style:'currency', currency:'USD'})}</p>
                                        <p><strong>Fee:</strong> {fee.toLocaleString('en-US',{style:'currency', currency:'USD'})}</p>
                                        <p><strong>Total:</strong> {totalCost.toLocaleString('en-US',{style:'currency', currency:'USD'})}</p>
                                        {formData.transferType === 'international' && <p><strong>Recipient Gets:</strong> ~{receiveAmount.toLocaleString('en-US',{style:'currency', currency:formData.recipientCountry.currency})}</p>}
                                        <p className="col-span-2"><strong>To:</strong> {formData.recipientName}</p>
                                        <p className="col-span-2"><strong>Bank:</strong> {formData.bankName} (••••{formData.accountNumber.slice(-4)})</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4 text-yellow-400">
                                        <ExclamationTriangleIcon className="w-6 h-6" />
                                        <h3 className="font-bold uppercase tracking-wide">Consent Declaration</h3>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" checked={consents.accuracy} onChange={e => setConsents({...consents, accuracy: e.target.checked})} className="mt-1 w-4 h-4 text-primary bg-transparent border-slate-500 rounded focus:ring-primary" />
                                            <span className="text-xs text-slate-300">I certify that the information provided is accurate. I understand that incorrect details may lead to loss of funds.</span>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" checked={consents.auth} onChange={e => setConsents({...consents, auth: e.target.checked})} className="mt-1 w-4 h-4 text-primary bg-transparent border-slate-500 rounded focus:ring-primary" />
                                            <span className="text-xs text-slate-300">I authorize iCredit Union to debit my account for the total amount including fees.</span>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" checked={consents.aml} onChange={e => setConsents({...consents, aml: e.target.checked})} className="mt-1 w-4 h-4 text-primary bg-transparent border-slate-500 rounded focus:ring-primary" />
                                            <span className="text-xs text-slate-300">I verify that this transaction complies with all applicable AML (Anti-Money Laundering) laws.</span>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" checked={consents.irrevocable} onChange={e => setConsents({...consents, irrevocable: e.target.checked})} className="mt-1 w-4 h-4 text-primary bg-transparent border-slate-500 rounded focus:ring-primary" />
                                            <span className="text-xs text-slate-300">I acknowledge that this wire transfer is <strong>irrevocable</strong> once released to the network.</span>
                                        </label>
                                    </div>
                                    {errors.consents && <p className="text-red-400 text-xs mt-3 font-bold">{errors.consents}</p>}
                                </div>

                                <FieldSet legend="Final Authorization">
                                     <label className="block text-sm font-medium text-slate-300">Enter your 4-digit security PIN to confirm.</label>
                                     <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className={`${inputClasses('pin')} w-48 mx-auto text-center tracking-[1em]`} placeholder="----" />
                                     {errors.pin && <p className="text-red-400 text-xs text-center">{errors.pin}</p>}
                                </FieldSet>
                             </div>
                        )}

                        {step === 4 && sentTransaction && (
                             <div className="text-center max-w-lg mx-auto animate-fade-in-up">
                                 <CheckCircleIcon className="w-20 h-20 text-green-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-slate-100">Wire Transfer Submitted</h3>
                                <p className="text-slate-300 mt-2">Your wire transfer has been initiated. You can track its progress in your transaction history.</p>
                                <div className="p-4 bg-slate-800/50 rounded-lg mt-6 text-left text-sm space-y-2">
                                     <p><strong>Transaction ID:</strong> <span className="font-mono">{sentTransaction.id}</span></p>
                                     <p><strong>Estimated Arrival:</strong> {sentTransaction.estimatedArrival.toLocaleDateString()}</p>
                                </div>
                             </div>
                        )}

                    </div>
                    
                    <div className="relative z-10 p-8 flex-shrink-0 border-t border-slate-700 bg-slate-900/50">
                       {step < 3 && (
                            <div className="max-w-lg mx-auto flex justify-between">
                                <button onClick={handleBack} disabled={step === 0} className="px-6 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg disabled:opacity-50">Back</button>
                                <button onClick={handleNext} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">Next</button>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="max-w-lg mx-auto flex justify-between gap-4">
                                <button onClick={onClose} className="flex-1 px-6 py-3 text-sm font-bold text-red-400 border border-red-900/50 hover:bg-red-900/20 rounded-lg transition-colors">
                                    Abort Transaction
                                </button>
                                <button onClick={handlePreSubmit} disabled={isProcessing} className="flex-1 px-6 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-500 rounded-lg shadow-lg shadow-green-900/20 flex items-center justify-center transition-all transform hover:scale-105">
                                    <LockClosedIcon className="w-4 h-4 mr-2" />
                                    {isProcessing ? 'Processing...' : 'Execute Wire'}
                                </button>
                            </div>
                        )}
                        {step === 4 && (
                             <div className="max-w-lg mx-auto text-center">
                                <button onClick={onClose} className="px-8 py-3 text-sm font-medium text-white bg-primary rounded-lg shadow-md">Done</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
