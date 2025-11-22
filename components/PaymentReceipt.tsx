
import React, { useState, useEffect } from 'react';
import { Transaction, Account, TransactionStatus } from '../types.ts';
import { USER_PROFILE } from '../constants.ts';
import { LiveTransactionView } from './LiveTransactionView.tsx';
import { 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    ArrowPathIcon,
    ClipboardDocumentIcon,
    SpinnerIcon,
    ICreditUnionLogo,
    ShieldCheckIcon,
    LockClosedIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    GlobeAmericasIcon,
    UserCircleIcon
} from './Icons.tsx';
import { AuthorizationWarningModal } from './AuthorizationWarningModal.tsx';
import { timeSince } from '../utils/time.ts';

declare const html2canvas: any;
declare const jspdf: any;

interface PaymentReceiptProps {
    transaction: Transaction;
    sourceAccount: Account;
    onStartOver: () => void;
    onViewActivity: () => void;
    onAuthorizeTransaction: (transactionId: string, method: 'code' | 'fee') => void;
    phone?: string;
    onContactSupport: () => void;
    accounts: Account[];
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; subValue?: string; isMono?: boolean }> = ({ label, value, subValue, isMono }) => (
    <div className="py-2 border-b border-slate-200/10 last:border-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">{label}</p>
        <p className={`text-slate-200 font-medium ${isMono ? 'font-mono text-sm' : 'text-sm'}`}>{value}</p>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
    </div>
);

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ transaction, sourceAccount, onStartOver, onViewActivity, onAuthorizeTransaction, phone, onContactSupport, accounts }) => {
    const totalDebited = transaction.sendAmount + transaction.fee;
    const isCompleted = transaction.status === TransactionStatus.FUNDS_ARRIVED;
    const [showAuthWarning, setShowAuthWarning] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showStamp, setShowStamp] = useState(false);

    useEffect(() => {
        if (transaction.status === TransactionStatus.IN_TRANSIT) {
             const timer = setTimeout(() => {
                setShowAuthWarning(true);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setShowAuthWarning(false);
        }
    }, [transaction.status]);

    useEffect(() => {
        setTimeout(() => setShowStamp(true), 800);
    }, []);

    const handleDownloadReceipt = () => {
        setIsGeneratingPdf(true);
        setTimeout(() => {
            const receiptElement = document.getElementById(`receipt-capture-${transaction.id}`);
            if (receiptElement && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
                html2canvas(receiptElement, { scale: 2, backgroundColor: '#0f172a' }).then((canvas: any) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jspdf.jsPDF({
                        orientation: 'portrait',
                        unit: 'px',
                        format: [canvas.width, canvas.height]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                    pdf.save(`iCU_Transaction_${transaction.id}.pdf`);
                    setIsGeneratingPdf(false);
                });
            } else {
                console.error('Could not generate PDF.');
                setIsGeneratingPdf(false);
            }
        }, 100);
    };

    const submissionDate = transaction.statusTimestamps[TransactionStatus.SUBMITTED] || new Date();
    const valueDate = new Date(submissionDate); // Typically same day for internal, +1/2 for wire
    
    const formattedDate = submissionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    const formattedTime = submissionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });

    // Generate realistic reference codes
    const trn = transaction.id.toUpperCase().replace('TXN_', 'TRN');
    const imad = `IMAD-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${new Date().getFullYear()}`;
    const digitalSignature = `SIG-RSA-4096-${Math.random().toString(36).substring(2, 18).toUpperCase()}`;

    return (
        <>
            {showAuthWarning && (
                <AuthorizationWarningModal
                    transaction={transaction}
                    onAuthorize={onAuthorizeTransaction}
                    onClose={() => setShowAuthWarning(false)}
                    onContactSupport={onContactSupport}
                    accounts={accounts}
                />
            )}

            <div className="fixed inset-0 z-0 pointer-events-none">
                 <div className="absolute inset-0 bg-slate-900/95"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto pb-12 animate-fade-in-up">
                
                {/* Tracker outside the printable receipt */}
                <div className="w-full mb-8 px-4">
                    <LiveTransactionView transaction={transaction} phone={phone} />
                </div>

                {/* THE RECEIPT CARD (Print Target) */}
                <div 
                    id={`receipt-capture-${transaction.id}`}
                    className="relative w-full bg-[#0f172a] border border-slate-700 rounded-none sm:rounded-lg shadow-2xl overflow-hidden text-slate-200 font-sans"
                >
                    {/* Watermark Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none overflow-hidden">
                        <ICreditUnionLogo />
                    </div>
                    
                    {/* Holographic Security Strip */}
                    <div className="absolute top-0 bottom-0 left-8 w-1 bg-gradient-to-b from-yellow-500 via-yellow-200 to-yellow-600 opacity-60 z-20 hidden sm:block"></div>

                    {/* Header Section */}
                    <div className="relative bg-slate-900 p-8 border-b border-slate-700">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div className="flex items-center gap-4 pl-0 sm:pl-6">
                                <div className="p-2 bg-white rounded-lg">
                                    <ICreditUnionLogo />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">iCredit Union®</h1>
                                    <p className="text--[10px] uppercase tracking-widest text-slate-400 font-semibold">Global Treasury Services</p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <h2 className="text-lg font-bold text-white uppercase">Payment Advice</h2>
                                <p className="text-xs text-slate-400 font-mono">Ref: {trn}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                    <BuildingOfficeIcon className="w-3 h-3" />
                                    <span>123 Finance Street, New York, NY 10001</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <GlobeAmericasIcon className="w-3 h-3" />
                                    <span>SWIFT: ICUSUS33</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Body */}
                    <div className="p-8 pl-4 sm:pl-14 relative">
                        
                        {/* Realistic Stamp */}
                        {isCompleted && (
                            <div className={`absolute top-12 right-12 z-30 pointer-events-none transition-all duration-700 ease-out mix-blend-screen ${showStamp ? 'opacity-80 scale-100 rotate-[-15deg]' : 'opacity-0 scale-150 rotate-[-30deg]'}`}>
                                <div className="w-36 h-36 border-[6px] border-green-500 rounded-full flex items-center justify-center p-2 opacity-70" style={{ maskImage: 'url(https://www.transparenttextures.com/patterns/grunge-wall.png)' }}>
                                    <div className="w-full h-full border-[2px] border-green-500 rounded-full flex flex-col items-center justify-center text-green-500 uppercase font-black text-center leading-none">
                                        <span className="text-xs tracking-widest mb-1">iCredit Union</span>
                                        <span className="text-2xl tracking-tighter">FUNDS</span>
                                        <span className="text-2xl tracking-tighter">CLEARED</span>
                                        <span className="text-[10px] font-mono mt-1">{formattedDate}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transaction Meta Data */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold">Execution Date</p>
                                <p className="text-white font-mono text-sm">{formattedDate}</p>
                                <p className="text-slate-500 text-[10px]">{formattedTime}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold">Value Date</p>
                                <p className="text-white font-mono text-sm">{valueDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                                    <span className={`text-sm font-bold ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {isCompleted ? 'COMPLETED' : 'PROCESSING'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Originator / Sender */}
                            <div>
                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 border-b border-primary/30 pb-2 flex items-center gap-2">
                                    <UserCircleIcon className="w-4 h-4" /> Originator (Sender)
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-white">{USER_PROFILE.name}</p>
                                    <div className="text-sm text-slate-400 space-y-0.5">
                                        <p>3797 Yorkshire Circle</p>
                                        <p>Greenville, NC 27834</p>
                                        <p>United States</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <PhoneIcon className="w-3 h-3" /> {USER_PROFILE.phone}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-800">
                                        <DetailRow label="Bank Name" value="iCredit Union®" />
                                        <DetailRow label="Account Number" value={sourceAccount.fullAccountNumber || sourceAccount.accountNumber} isMono />
                                        <DetailRow label="Account Type" value={sourceAccount.type} />
                                    </div>
                                </div>
                            </div>

                            {/* Beneficiary / Recipient */}
                            <div>
                                <h3 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-4 border-b border-green-500/30 pb-2 flex items-center gap-2">
                                    <ArrowDownTrayIcon className="w-4 h-4" /> Beneficiary (Recipient)
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-white">{transaction.recipient.fullName}</p>
                                    <div className="text-sm text-slate-400 space-y-0.5">
                                        <p>{transaction.recipient.streetAddress || '123 Recipient Lane'}</p>
                                        <p>{transaction.recipient.city}, {transaction.recipient.stateProvince} {transaction.recipient.postalCode}</p>
                                        <p>{transaction.recipient.country.name}</p>
                                        {transaction.recipient.phone && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <PhoneIcon className="w-3 h-3" /> {transaction.recipient.phone}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-800">
                                        <DetailRow label="Bank Name" value={transaction.recipient.bankName} />
                                        <DetailRow label="Account Number / IBAN" value={transaction.recipient.realDetails.accountNumber} isMono />
                                        <DetailRow label="SWIFT / BIC" value={transaction.recipient.realDetails.swiftBic} isMono />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="mt-10">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">Payment Details</h3>
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Principal Amount</span>
                                            <span className="text-white font-mono">{transaction.sendAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Network Fee</span>
                                            <span className="text-white font-mono">{transaction.fee.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Exchange Rate</span>
                                            <span className="text-white font-mono">{transaction.exchangeRate.toFixed(4)}</span>
                                        </div>
                                    </div>
                                    <div className="border-t sm:border-t-0 sm:border-l border-slate-700 pt-4 sm:pt-0 sm:pl-8 flex flex-col justify-center">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-sm font-bold text-slate-300 uppercase">Total Debited</span>
                                            <span className="text-xl font-bold text-white font-mono">{totalDebited.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-sm font-bold text-green-400 uppercase">Beneficiary Receives</span>
                                            <span className="text-xl font-bold text-green-400 font-mono">{transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.receiveCurrency })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Codes */}
                        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-end text-[10px] text-slate-500 font-mono">
                            <div className="space-y-1">
                                <p>IMAD: {imad}</p>
                                <p>Digital Signature: <span className="text-slate-600 break-all">{digitalSignature}</span></p>
                                <p className="mt-2 text-slate-600 font-sans max-w-md">
                                    This is an electronically generated receipt from iCredit Union Global Settlement Network. 
                                    It does not require a physical signature. Validated via 256-bit SSL Encryption.
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0 text-right">
                                <img src={`https://quickchart.io/qr?text=iCredit-Receipt-${transaction.id}-${imad}&size=120&format=svg`} alt="QR" className="w-20 h-20 ml-auto opacity-80 bg-white p-1 rounded" />
                                <p className="mt-1">Scan to Verify</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8 px-4">
                    <button 
                        onClick={handleDownloadReceipt} 
                        disabled={isGeneratingPdf}
                        className="flex items-center justify-center space-x-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold shadow-lg border border-white/5 transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                        {isGeneratingPdf ? <SpinnerIcon className="w-5 h-5"/> : <ArrowDownTrayIcon className="w-5 h-5" />}
                        <span>{isGeneratingPdf ? 'Generating PDF...' : 'Save Official PDF'}</span>
                    </button>
                    
                    <button 
                        onClick={onStartOver} 
                        className="flex items-center justify-center space-x-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold shadow-lg border border-white/5 transition-all transform hover:scale-105"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>New Transfer</span>
                    </button>
                    
                    <button 
                        onClick={onViewActivity} 
                        className="flex items-center justify-center space-x-2 py-4 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-105"
                    >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                        <span>Return to History</span>
                    </button>
                </div>
            </div>
        </>
    );
};