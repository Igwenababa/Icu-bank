
import React, { useState, useEffect } from 'react';
import { Account, AccountType, Transaction, VerificationLevel } from '../types.ts';
import { getAccountPerks } from '../services/geminiService.ts';
// FIX: Renamed ApexBankLogo to ICreditUnionLogo to fix the import error.
// FIX: Imported the missing `BankIcon` component.
// FIX: Add missing icons
import { SpinnerIcon, ShieldCheckIcon, CreditCardIcon, PiggyBankIcon, BuildingOfficeIcon, BankIcon, DepositIcon, CheckCircleIcon, PencilIcon, getBankIcon, ICreditUnionLogo, ClockIcon, ClipboardDocumentIcon, GlobeAmericasIcon } from './Icons.tsx';
import { USER_PROFILE, EXCHANGE_RATES } from '../constants.ts';

interface AccountsProps {
    accounts: Account[];
    transactions: Transaction[];
    verificationLevel: VerificationLevel;
    onUpdateAccountNickname: (accountId: string, nickname: string) => void;
    displayCurrency?: string;
}

const UserProfileCard: React.FC<{ verificationLevel: VerificationLevel }> = ({ verificationLevel }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full max-w-sm mx-auto cursor-pointer group" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
            <div
                className="relative w-full h-56 transition-transform duration-700"
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
                {/* Front */}
                <div className="absolute w-full h-full p-6 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg flex flex-col justify-between" style={{ backfaceVisibility: 'hidden' }}>
                    <div>
                        <div className="flex justify-between items-start">
                             <h3 className="font-bold text-xl">{USER_PROFILE.name}</h3>
                             <ICreditUnionLogo />
                        </div>
                        <p className="text-sm opacity-80">{USER_PROFILE.email}</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        <img src={USER_PROFILE.profilePictureUrl} alt="User" className="w-12 h-12 rounded-full border-2 border-primary-300" />
                        <div>
                             <p className="text-xs opacity-80">Member Since</p>
                             <p className="font-semibold">Jan 2024</p>
                        </div>
                    </div>
                </div>
                {/* Back */}
                 <div className="absolute w-full h-full p-6 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg flex flex-col justify-between" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Account Status</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-400"/>
                                <span>Identity: {verificationLevel}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <ShieldCheckIcon className="w-5 h-5 text-green-400"/>
                                <span>2FA Enabled</span>
                            </div>
                             <div className="flex items-center space-x-2">
                                <CreditCardIcon className="w-5 h-5 text-green-400"/>
                                <span>3 Active Cards</span>
                            </div>
                        </div>
                    </div>
                     <p className="text-xs text-slate-400 text-right">Tap to flip back</p>
                </div>
            </div>
        </div>
    );
};


const AccountPerks: React.FC<{ accountType: AccountType, verificationLevel: VerificationLevel }> = ({ accountType, verificationLevel }) => {
    const [perks, setPerks] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getAccountPerks(accountType, verificationLevel).then(result => {
            if (!result.isError) {
                setPerks(result.perks);
            }
            setIsLoading(false);
        });
    }, [accountType, verificationLevel]);

    return (
        <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset mt-4">
            <h4 className="font-bold text-slate-700">AI-Powered Perks</h4>
            {isLoading ? (
                <div className="flex items-center space-x-2 text-sm text-slate-500 mt-2">
                    <SpinnerIcon className="w-4 h-4" />
                    <span>Analyzing perks...</span>
                </div>
            ) : (
                <ul className="mt-2 space-y-2">
                    {perks.map((perk, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                            <ShieldCheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{perk}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

interface AccountCardProps {
    account: Account;
    onUpdateNickname: (id: string, name: string) => void;
    verificationLevel: VerificationLevel;
    displayCurrency: string;
}

// FIX: Added missing AccountCard and Accounts components to resolve export error.
const AccountCard: React.FC<AccountCardProps> = ({ account, onUpdateNickname, verificationLevel, displayCurrency }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState(account.nickname || '');

    const handleSave = () => {
        onUpdateNickname(account.id, nickname);
        setIsEditing(false);
    };

    const getIcon = () => {
        switch (account.type) {
            case AccountType.CHECKING: return <CreditCardIcon className="w-6 h-6" />;
            case AccountType.SAVINGS: return <PiggyBankIcon className="w-6 h-6" />;
            case AccountType.BUSINESS: return <BuildingOfficeIcon className="w-6 h-6" />;
            case AccountType.EXTERNAL_LINKED: return <BankIcon className="w-6 h-6" />;
        }
    };
    
    const exchangeRate = EXCHANGE_RATES[displayCurrency] || 1;
    const convertedBalance = account.balance * exchangeRate;

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shadow-digital text-primary">{getIcon()}</div>
                    <div>
                        {isEditing ? (
                            <input value={nickname} onChange={e => setNickname(e.target.value)} onBlur={handleSave} autoFocus className="font-bold text-xl text-slate-800 bg-transparent border-b-2 border-primary" />
                        ) : (
                            <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-xl text-slate-800">{account.nickname || account.type}</h3>
                                <button onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 text-slate-400 hover:text-primary" /></button>
                            </div>
                        )}
                        <p className="text-sm text-slate-500 font-mono">{account.accountNumber}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800 font-mono">{convertedBalance.toLocaleString('en-US', { style: 'currency', currency: displayCurrency })}</p>
                    <p className="text-xs text-slate-500">{account.status}</p>
                </div>
            </div>
            {account.type !== AccountType.EXTERNAL_LINKED && <AccountPerks accountType={account.type} verificationLevel={verificationLevel} />}
        </div>
    );
};


export const Accounts: React.FC<AccountsProps> = ({ accounts, transactions, verificationLevel, onUpdateAccountNickname, displayCurrency = 'USD' }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <UserProfileCard verificationLevel={verificationLevel} />

        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">My Accounts</h2>
            <div className="space-y-6">
                {accounts.map(account => (
                    <AccountCard 
                        key={account.id} 
                        account={account} 
                        onUpdateNickname={onUpdateAccountNickname}
                        verificationLevel={verificationLevel}
                        displayCurrency={displayCurrency}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};
