
import React, { useState } from 'react';
import { WalletDetails, WalletTransaction } from '../types.ts';
import { INITIAL_WALLET_TRANSACTIONS } from '../constants.ts';
import { 
    ICreditUnionLogo, 
    CreditCardIcon, 
    ArrowUpCircleIcon, 
    ArrowDownCircleIcon, 
    QrCodeIcon, 
    PlusCircleIcon, 
    ArrowsRightLeftIcon,
    WifiIcon,
    ShieldCheckIcon,
    GlobeAmericasIcon,
    CheckCircleIcon
} from './Icons.tsx';
import { timeSince } from '../utils/time.ts';

interface DigitalWalletProps {
    wallet: WalletDetails;
}

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; color?: string }> = ({ icon, label, onClick, color = 'bg-slate-700' }) => (
    <button 
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,82,255,0.15)] w-full"
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white shadow-lg transition-transform group-hover:scale-110 ${color}`}>
            {icon}
        </div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">{label}</span>
    </button>
);

const LinkedCard: React.FC<{ lastFour: string; type: string; expiry: string }> = ({ lastFour, type, expiry }) => (
    <div className="flex-shrink-0 w-64 h-36 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-white/5 shadow-lg relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type}</span>
                {type === 'Visa' ? (
                    <div className="text-white font-bold italic text-lg">VISA</div>
                ) : (
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 bg-red-500 rounded-full opacity-80"></div>
                        <div className="w-6 h-6 bg-yellow-500 rounded-full opacity-80"></div>
                    </div>
                )}
            </div>
            <div>
                <p className="text-white font-mono tracking-widest">•••• {lastFour}</p>
                <p className="text-[10px] text-slate-500 mt-1">Exp {expiry}</p>
            </div>
        </div>
    </div>
);

const TransactionRow: React.FC<{ transaction: WalletTransaction }> = ({ transaction }) => {
    const isCredit = transaction.type === 'credit';
    const amountColor = isCredit ? 'text-emerald-400' : 'text-white';
    const sign = isCredit ? '+' : '-';

    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-4 -mx-4 rounded-lg group">
            <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                    {isCredit ? <ArrowDownCircleIcon className="w-5 h-5" /> : <ArrowUpCircleIcon className="w-5 h-5" />}
                </div>
                <div>
                    <p className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">{transaction.description}</p>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{timeSince(transaction.date)}</p>
                </div>
            </div>
            <p className={`font-bold font-mono ${amountColor}`}>
                {sign}{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
        </div>
    );
};

export const DigitalWallet: React.FC<DigitalWalletProps> = ({ wallet }) => {
    const transactions = INITIAL_WALLET_TRANSACTIONS;
    const [showBalance, setShowBalance] = useState(true);

    return (
        <div className="relative min-h-screen pb-12">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-10 pt-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                <CreditCardIcon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Digital Wallet</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md">
                            Your central hub for global payments. Secure, instant, and borderless.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-full backdrop-blur-md shadow-lg">
                        <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Biometric Secured</span>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <WifiIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">NFC Active</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left: The "Obsidian" Card & Actions */}
                    <div className="lg:col-span-5 space-y-8">
                        
                        {/* 3D Card Container */}
                        <div className="relative group perspective-1000 w-full aspect-[1.586/1]">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                            
                            {/* The Card */}
                            <div className="relative w-full h-full rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden transform transition-transform duration-500 hover:rotate-y-6 hover:rotate-x-6">
                                {/* Texture */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                                
                                {/* Holographic Sheen */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundSize: '200% 200%', animation: 'shine 3s infinite linear' }}></div>

                                <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <ICreditUnionLogo />
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">iCU World Elite</span>
                                            <WifiIcon className="w-5 h-5 text-slate-500 mt-1 rotate-90" />
                                        </div>
                                    </div>

                                    <div className="my-auto">
                                        <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Total Balance</p>
                                        <div className="flex items-center gap-3">
                                            <h3 className={`text-4xl font-mono font-bold text-white tracking-tight ${showBalance ? '' : 'blur-md'}`}>
                                                {wallet.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                            </h3>
                                            <button onClick={() => setShowBalance(!showBalance)} className="text-slate-500 hover:text-white transition-colors">
                                                {/* Eye Icon toggle would go here */}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Card Holder</p>
                                            <p className="text-sm font-bold text-slate-200 uppercase tracking-wide">Herbert Lawrence</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2 mb-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-[10px] text-green-400 font-bold uppercase">Active</span>
                                            </div>
                                            <p className="font-mono text-sm text-slate-300">•••• {wallet.cardLastFour}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-4 gap-3">
                            <QuickAction icon={<PlusCircleIcon className="w-6 h-6" />} label="Top Up" onClick={() => {}} color="bg-emerald-600" />
                            <QuickAction icon={<ArrowsRightLeftIcon className="w-6 h-6" />} label="Send" onClick={() => {}} color="bg-blue-600" />
                            <QuickAction icon={<QrCodeIcon className="w-6 h-6" />} label="Scan" onClick={() => {}} color="bg-purple-600" />
                            <QuickAction icon={<GlobeAmericasIcon className="w-6 h-6" />} label="Exchange" onClick={() => {}} color="bg-orange-600" />
                        </div>

                    </div>

                    {/* Right: Details & History */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* Linked Methods */}
                        <div>
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="text-lg font-bold text-white">Linked Methods</h3>
                                <button className="text-xs font-bold text-primary-400 hover:text-primary-300 uppercase tracking-wide">+ Add New</button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                <LinkedCard type="Visa" lastFour="4242" expiry="12/28" />
                                <LinkedCard type="Mastercard" lastFour="8892" expiry="09/26" />
                                <div className="flex-shrink-0 w-16 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 transition-all cursor-pointer">
                                    <PlusCircleIcon className="w-6 h-6 text-slate-600" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                                <button className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wide transition-colors">View All</button>
                            </div>
                            <div className="space-y-1">
                                {transactions.length > 0 ? (
                                    transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                            <CreditCardIcon className="w-8 h-8" />
                                        </div>
                                        <p className="text-slate-500 text-sm">No recent transactions found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
