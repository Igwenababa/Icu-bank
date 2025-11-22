
import React, { useState, useMemo } from 'react';
import { Transaction, Recipient, Account, TravelPlan, TravelPlanStatus, View, UserProfile, TransactionStatus } from '../types.ts';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    GlobeAmericasIcon, 
    MapPinIcon, 
    TrendingUpIcon, 
    ArrowUpCircleIcon, 
    ArrowDownCircleIcon, 
    CreditCardIcon, 
    CurrencyDollarIcon,
    BuildingOfficeIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ChartBarIcon,
    getBankIcon
} from './Icons.tsx';
import { AccountCarousel } from './AccountCarousel.tsx';
import { QuickTransfer } from './QuickTransfer.tsx';
import { FinancialNews } from './FinancialNews.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { EXCHANGE_RATES } from '../constants.ts';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  recipients: Recipient[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>) => Promise<Transaction | null>;
  setActiveView: (view: View) => void;
  travelPlans: TravelPlan[];
  totalNetWorth: number;
  portfolioChange24h: number;
  userProfile: UserProfile;
  displayCurrency?: string;
}

// Mini Transaction Row Component
const DashboardTransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isCredit = tx.type === 'credit';
    const date = tx.statusTimestamps[TransactionStatus.SUBMITTED] || new Date();
    
    const BankIconComponent = useMemo(() => isCredit ? null : getBankIcon(tx.recipient.bankName), [isCredit, tx.recipient.bankName]);

    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-700/50 last:border-0 hover:bg-white/5 transition-colors px-3 rounded-lg group cursor-default">
            <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-white shadow-sm overflow-hidden'}`}>
                    {isCredit ? <ArrowDownCircleIcon className="w-6 h-6" /> : (BankIconComponent && <BankIconComponent className="w-6 h-6 object-contain" />)}
                 </div>
                 <div>
                     <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{isCredit ? 'Deposit' : tx.recipient.fullName}</p>
                     <p className="text-xs text-slate-500 font-medium">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {!isCredit && <span className="text-slate-400"> • {tx.recipient.bankName}</span>}
                     </p>
                 </div>
            </div>
            <span className={`font-mono text-sm font-semibold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                {isCredit ? '+' : '-'}{tx.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({
  accounts,
  transactions,
  recipients,
  createTransaction,
  setActiveView,
  travelPlans,
  totalNetWorth,
  portfolioChange24h,
  userProfile,
  displayCurrency = 'USD',
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { t } = useLanguage();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const time = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    return `Good ${time}, ${userProfile.name.split(' ')[0]}`;
  }, [userProfile.name]);

  const activeTravelPlans = travelPlans.filter(plan => plan.status === TravelPlanStatus.ACTIVE);

  // Currency Conversion Logic
  const exchangeRate = EXCHANGE_RATES[displayCurrency] || 1;
  const convertedNetWorth = totalNetWorth * exchangeRate;

  return (
    <div className="space-y-8 animate-fade-in-up font-sans">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-sm">{greeting}</h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm font-medium">
             <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Secure Session Active
          </p>
        </div>
         <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
            <MapPinIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">New York, USA</span>
        </div>
      </header>

      {activeTravelPlans.length > 0 && (
        <div className="bg-blue-900/30 border border-blue-500/30 backdrop-blur-md text-blue-200 p-4 rounded-xl flex items-center space-x-4 shadow-lg">
          <div className="p-2 bg-blue-500/20 rounded-full">
            <GlobeAmericasIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
             <p className="text-sm font-bold text-blue-100">Travel Mode Active</p>
             <p className="text-xs text-blue-300/80">Cards authorized for use in: {activeTravelPlans.map(p => p.country.name).join(', ')}.</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Accounts & Wealth Dashboard */}
        <div className="xl:col-span-3 space-y-8">
             
             {/* Enhanced Accounts Section with Integrated Wealth Header */}
             <section aria-label="Your Accounts" className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-1 overflow-hidden shadow-2xl">
                
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary-900/20 to-transparent pointer-events-none"></div>
                
                {/* Unified Header: Title + Wealth Stats */}
                <div className="relative z-10 p-6 pb-2 flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-white/5 mb-6">
                    <div className="mb-4 lg:mb-0">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            My Accounts
                            <span className="bg-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-white/5 tracking-wide">{accounts.length} ACTIVE</span>
                        </h3>
                        <button onClick={() => setActiveView('accounts')} className="text-xs font-bold text-primary-400 hover:text-primary-300 tracking-wide uppercase transition-colors mt-2 flex items-center gap-1">
                            Manage Portfolio <ArrowUpCircleIcon className="w-3 h-3 rotate-45" />
                        </button>
                    </div>

                    {/* Integrated Financial Health & Net Worth Widgets */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        
                        {/* Financial Health Pill */}
                        <div className="flex items-center justify-between gap-4 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 min-w-[180px] hover:bg-slate-800/70 transition-colors">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Fin. Health</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-emerald-400 font-bold text-sm">Excellent</span>
                                </div>
                            </div>
                            <div className="relative">
                                <svg className="w-10 h-10 transform -rotate-90">
                                    <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="stroke-slate-700/50" />
                                    <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" strokeDasharray="100" strokeDashoffset="18" strokeLinecap="round" className="stroke-emerald-500 animate-pulse" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white">812</span>
                                </div>
                            </div>
                        </div>

                        {/* Total Net Worth Pill */}
                        <div className="flex items-center justify-between gap-6 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md px-5 py-2 rounded-xl border border-white/10 min-w-[240px] shadow-lg">
                            <div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
                                    Total Net Worth
                                    <button 
                                        onClick={() => setIsBalanceVisible(!isBalanceVisible)} 
                                        className="text-slate-500 hover:text-white transition-colors"
                                    >
                                        {isBalanceVisible ? <EyeSlashIcon className="w-3 h-3" /> : <EyeIcon className="w-3 h-3" />}
                                    </button>
                                </div>
                                <div className={`text-xl font-bold text-white tracking-tight transition-all duration-500 ${isBalanceVisible ? '' : 'blur-sm select-none'}`}>
                                    {isBalanceVisible ? convertedNetWorth.toLocaleString('en-US', { style: 'currency', currency: displayCurrency }) : '$ •••••••••'}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1 border border-emerald-500/20">
                                    <TrendingUpIcon className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[10px] font-bold text-emerald-400">+{portfolioChange24h}%</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Carousel Container */}
                <div className="pb-6 px-2">
                    <AccountCarousel 
                        accounts={accounts} 
                        isBalanceVisible={isBalanceVisible} 
                        setActiveView={setActiveView} 
                        displayCurrency={displayCurrency}
                        exchangeRate={exchangeRate}
                    />
                </div>
            </section>

            {/* Shortcuts Grid */}
            <section className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/5 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-5">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                     <button onClick={() => setActiveView('services')} className="p-4 bg-slate-700/30 hover:bg-slate-700/60 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border border-white/5 hover:border-white/10 group">
                        <div className="p-2.5 bg-primary/20 rounded-xl text-primary group-hover:scale-110 transition-transform">
                            <CreditCardIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Pay Bills</span>
                     </button>
                     <button onClick={() => setActiveView('checkin')} className="p-4 bg-slate-700/30 hover:bg-slate-700/60 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border border-white/5 hover:border-white/10 group">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                            <GlobeAmericasIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Travel Mode</span>
                     </button>
                      <button onClick={() => setActiveView('invest')} className="p-4 bg-slate-700/30 hover:bg-slate-700/60 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border border-white/5 hover:border-white/10 group">
                        <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                            <TrendingUpIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Investments</span>
                     </button>
                     <button onClick={() => setActiveView('support')} className="p-4 bg-slate-700/30 hover:bg-slate-700/60 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border border-white/5 hover:border-white/10 group">
                        <div className="p-2.5 bg-orange-500/20 rounded-xl text-orange-400 group-hover:scale-110 transition-transform">
                            <BuildingOfficeIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Support</span>
                     </button>
                </div>
            </section>

            {/* Quick Transfer */}
            <section>
                 <QuickTransfer
                    accounts={accounts}
                    recipients={recipients}
                    createTransaction={createTransaction}
                />
            </section>
            
            {/* Recent Activity */}
            <section className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/5 p-6 shadow-lg">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                    <button onClick={() => setActiveView('history')} className="text-xs font-bold text-primary-400 hover:text-primary-300 tracking-wide uppercase transition-colors">View All History</button>
                </div>
                <div className="space-y-1">
                     {transactions.slice(0, 5).map(tx => <DashboardTransactionRow key={tx.id} tx={tx} />)}
                </div>
            </section>
            
             {/* Financial News Compact */}
             <section>
                <div className="mb-4 px-1">
                     <h3 className="text-xl font-bold text-white">Market Insights</h3>
                </div>
                <FinancialNews />
             </section>
        </div>
      </div>
    </div>
  );
};
