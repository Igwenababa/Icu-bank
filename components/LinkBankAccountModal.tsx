import React, { useState, useEffect } from 'react';
import { SpinnerIcon, BankIcon, CheckCircleIcon, ShieldCheckIcon, LockClosedIcon } from './Icons.tsx';
import { BANKS_BY_COUNTRY } from '../constants';
import { getBankIcon } from './Icons.tsx';

interface LinkBankAccountModalProps {
  onClose: () => void;
  onLinkSuccess: (bankName: string, accountName: string, lastFour: string) => void;
}

type Step = 'select_bank' | 'credentials' | 'select_account' | 'processing' | 'success';

// FIX: Correctly map the bank objects to extract just the name, resolving type errors.
const mockBanks = BANKS_BY_COUNTRY.US.map(bank => ({ name: bank.name }));
const mockAccounts: Record<string, { name: string; lastFour: string; balance: number }[]> = {
    'Chase Bank': [{ name: 'College Checking', lastFour: '1234', balance: 5432.10 }, { name: 'Total Savings', lastFour: '5678', balance: 25109.42 }],
    'Bank of America': [{ name: 'Advantage Plus Banking', lastFour: '9876', balance: 12345.67 }],
    'Wells Fargo': [{ name: 'Everyday Checking', lastFour: '5432', balance: 8765.43 }, { name: 'Way2Save Savings', lastFour: '2109', balance: 50231.00 }],
    'Citibank': [{ name: 'Basic Banking Account', lastFour: '1111', balance: 3456.78 }],
    'PNC Bank': [{ name: 'Virtual Wallet', lastFour: '2222', balance: 7890.12 }],
};

export const LinkBankAccountModal: React.FC<LinkBankAccountModalProps> = ({ onClose, onLinkSuccess }) => {
    const [step, setStep] = useState<Step>('select_bank');
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [processingMessage, setProcessingMessage] = useState('Securely connecting...');

    useEffect(() => {
        let interval: number;
        if (step === 'processing' && selectedBank) {
            const messages = [
                `Connecting to ${selectedBank}...`,
                'Encrypting credentials...',
                'Fetching accounts...',
                'Finalizing secure link...'
            ];
            let messageIndex = 0;
            setProcessingMessage(messages[0]);
            
            interval = window.setInterval(() => {
                messageIndex++;
                if (messageIndex < messages.length) {
                    setProcessingMessage(messages[messageIndex]);
                } else {
                    clearInterval(interval);
                }
            }, 900);
        }
        return () => clearInterval(interval);
    }, [step, selectedBank]);


    const handleBankSelect = (bankName: string) => {
        setSelectedBank(bankName);
        setStep('credentials');
    };

    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('processing');
        setProcessingMessage('Authenticating...');
        setTimeout(() => {
            setStep('select_account');
        }, 1500);
    };

    const handleAccountSelect = (account: { name: string; lastFour: string; }) => {
        setSelectedAccount(`${account.name} (•••• ${account.lastFour})`);
        setStep('processing');
        setProcessingMessage('Finalizing secure link...');
        setTimeout(() => {
            if (selectedBank) {
                onLinkSuccess(selectedBank, account.name, account.lastFour);
            }
            setStep('success');
            setTimeout(onClose, 2000);
        }, 2000);
    };

    const renderContent = () => {
        switch (step) {
            case 'select_bank':
                return (
                    <div className="space-y-4">
                        {mockBanks.map(bank => {
                             const BankLogo = getBankIcon(bank.name);
                             return (
                                <button key={bank.name} onClick={() => handleBankSelect(bank.name)} className="w-full flex items-center space-x-4 p-4 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset text-left">
                                    <BankLogo className="w-10 h-10 rounded-md bg-white p-1" />
                                    <span className="font-semibold text-slate-700">{bank.name}</span>
                                </button>
                             )
                        })}
                    </div>
                );
            case 'credentials':
                 return (
                    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                        <input type="text" placeholder="Username" className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset" defaultValue="demo_user" />
                        <input type="password" placeholder="Password" className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset" defaultValue="password" />
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setStep('select_bank')} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg shadow-digital">Back</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">Continue</button>
                        </div>
                    </form>
                );
            case 'select_account':
                const accounts = selectedBank ? mockAccounts[selectedBank as keyof typeof mockAccounts] || [] : [];
                return (
                    <div className="space-y-3">
                        {accounts.map(acc => (
                             <button key={acc.name} onClick={() => handleAccountSelect(acc)} className="w-full flex justify-between items-center p-4 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset text-left">
                                 <div>
                                    <p className="font-semibold text-slate-700">{acc.name}</p>
                                    <p className="text-sm text-slate-500">•••• {acc.lastFour}</p>
                                 </div>
                                 <p className="font-mono text-slate-600">{acc.balance.toLocaleString('en-US',{style:'currency',currency:'USD'})}</p>
                             </button>
                        ))}
                    </div>
                );
            case 'processing':
                return (
                    <div className="text-center p-8">
                        <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                        <p className="mt-4 font-semibold text-slate-700">{processingMessage}</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center p-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">Account Linked!</h3>
                        <p className="text-slate-600 mt-2">{selectedAccount} has been successfully linked.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 flex flex-col max-h-[90vh]">
                 <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4 shadow-digital-inset">
                        {step === 'success' ? <CheckCircleIcon className="w-8 h-8 text-green-500"/> : <BankIcon className="w-8 h-8 text-slate-600" />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Link Bank Account</h2>
                    <p className="text-sm text-slate-500 mt-2 flex items-center justify-center space-x-2"><LockClosedIcon className="w-4 h-4" /><span>Powered by a secure, encrypted connection.</span></p>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {renderContent()}
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">&times;</button>
            </div>
        </div>
    );
};