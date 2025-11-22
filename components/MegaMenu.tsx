
import React, { useEffect, useState } from 'react';
import { 
    DashboardIcon, SendIcon, UserGroupIcon, ActivityIcon, CogIcon, CreditCardIcon, 
    LifebuoyIcon, CashIcon, QuestionMarkCircleIcon, WalletIcon, ChartBarIcon, 
    ShoppingBagIcon, MapPinIcon, XIcon, ICreditUnionLogo, CubeTransparentIcon,
    ClipboardDocumentIcon, AirplaneTicketIcon, WrenchScrewdriverIcon, PuzzlePieceIcon, SparklesIcon,
    TrendingUpIcon, PlusCircleIcon, MapIcon, LightningBoltIcon, QrCodeIcon, ShieldCheckIcon,
    GlobeAmericasIcon,
    BuildingOfficeIcon,
    ChatBubbleLeftRightIcon,
    StarIcon,
    HeartIcon,
    LogoutIcon
} from './Icons.tsx';
import { View, UserProfile } from '../types.ts';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: View;
  setActiveView: (view: View) => void;
  userProfile: UserProfile;
  onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
  onOpenWireTransfer: () => void;
}

type MenuCategory = 'Banking' | 'Payments' | 'Wealth' | 'Lifestyle' | 'Support' | 'Company';

const CATEGORY_IMAGES: Record<MenuCategory, string> = {
    Banking: 'https://images.unsplash.com/photo-1565514020176-dbf2277e9e6e?q=80&w=2940&auto=format&fit=crop', // Abstract Modern Building
    Payments: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2940&auto=format&fit=crop', // Digital Payment/Tech
    Wealth: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2864&auto=format&fit=crop', // Gold/Chart
    Lifestyle: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2948&auto=format&fit=crop', // Travel/Plane
    Support: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940&auto=format&fit=crop', // Skyscrapers/Corporate
    Company: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2938&auto=format&fit=crop', // Office
};

const menuConfig: {
    id: MenuCategory;
    title: string;
    items: {
        view: View;
        label: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
    }[];
}[] = [
    {
        id: 'Banking',
        title: 'Everyday Banking',
        items: [
            { view: 'dashboard', label: 'Dashboard', description: "Portfolio overview.", icon: DashboardIcon },
            { view: 'accounts', label: 'My Accounts', description: "Checking, Savings & Loans.", icon: WalletIcon },
            { view: 'cards', label: 'Cards & Wallet', description: "Manage physical & virtual cards.", icon: CreditCardIcon },
            { view: 'wallet', label: 'Digital Wallet', description: "Contactless payments.", icon: CreditCardIcon },
        ]
    },
    {
        id: 'Payments',
        title: 'Global Payments',
        items: [
            { view: 'send', label: 'Transfer Funds', description: "Domestic & P2P.", icon: SendIcon },
            { view: 'wire', label: 'Wire Transfer', description: "SWIFT & IBAN networks.", icon: GlobeAmericasIcon },
            { view: 'recipients', label: 'Beneficiaries', description: "Manage contacts.", icon: UserGroupIcon },
            { view: 'history', label: 'Transaction Log', description: "Audit & history.", icon: ActivityIcon },
            { view: 'integrations', label: 'Connected Apps', description: "PayPal, Zelle, etc.", icon: PuzzlePieceIcon },
        ]
    },
    {
        id: 'Wealth',
        title: 'Wealth & Growth',
        items: [
            { view: 'invest', label: 'Investments', description: "Markets & Stocks.", icon: TrendingUpIcon },
            { view: 'crypto', label: 'Digital Assets', description: "Crypto portfolio.", icon: ChartBarIcon },
            { view: 'advisor', label: 'Private Advisor', description: "AI Financial insights.", icon: SparklesIcon },
            { view: 'loans', label: 'Lending', description: "Personal & Business loans.", icon: CashIcon },
            { view: 'insurance', label: 'Insurance', description: "Asset protection.", icon: LifebuoyIcon },
        ]
    },
    {
        id: 'Lifestyle',
        title: 'Lifestyle Services',
        items: [
            { view: 'flights', label: 'Concierge Travel', description: "Book flights globally.", icon: AirplaneTicketIcon },
            { view: 'checkin', label: 'Travel Mode', description: "Card usage abroad.", icon: MapPinIcon },
            { view: 'utilities', label: 'Bill Payment', description: "Utilities & Services.", icon: WrenchScrewdriverIcon },
            { view: 'services', label: 'Subscriptions', description: "Recurring payments.", icon: ShoppingBagIcon },
            { view: 'globalAid', label: 'Global Aid', description: "Philanthropy.", icon: HeartIcon },
        ]
    },
    {
        id: 'Support',
        title: 'System & Support',
        items: [
            { view: 'security', label: 'Security Center', description: "2FA & Biometrics.", icon: ShieldCheckIcon },
            { view: 'support', label: 'Help Desk', description: "24/7 Support.", icon: QuestionMarkCircleIcon },
            { view: 'privacy', label: 'Privacy Control', description: "Data management.", icon: ShieldCheckIcon },
            { view: 'platform', label: 'Settings', description: "App preferences.", icon: CogIcon },
        ]
    },
];

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, activeView, setActiveView, userProfile, onOpenSendMoneyFlow, onOpenWireTransfer }) => {
    const [hoveredCategory, setHoveredCategory] = useState<MenuCategory>('Banking');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleItemClick = (view: View) => {
        if (view === 'send') {
            onOpenSendMoneyFlow('send');
        } else if (view === 'wire') {
            onOpenWireTransfer();
        } else {
            setActiveView(view);
        }
        onClose();
    };

    return (
        <>
            {/* Backdrop with Blur */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Main Mega Menu Container */}
            <div
                className={`fixed inset-y-0 left-0 w-full max-w-[95%] md:max-w-[1200px] bg-slate-900/95 backdrop-blur-2xl z-[50] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
            >
                {/* Left Column: Navigation (Scrollable) */}
                <div className="flex-grow flex flex-col h-full w-full md:w-2/3 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
                    
                    {/* Brand Header */}
                    <div className="flex-shrink-0 flex justify-between items-center p-8 border-b border-white/5 sticky top-0 bg-slate-900/95 z-20 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                <ICreditUnionLogo />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">iCredit Union®</h2>
                                <p className="text-xs text-slate-400 uppercase tracking-widest">Global Private Banking</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-300" aria-label="Close menu">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Grid */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {menuConfig.map((category, catIndex) => (
                            <div 
                                key={category.id} 
                                className="space-y-4 group/category"
                                onMouseEnter={() => setHoveredCategory(category.id)}
                            >
                                <h3 className="flex items-center gap-3 text-xs font-bold text-primary-400 uppercase tracking-widest pb-2 border-b border-white/5 group-hover/category:border-primary/30 transition-colors duration-500">
                                    <span className="w-2 h-2 rounded-full bg-primary group-hover/category:shadow-[0_0_10px_rgba(0,82,255,0.8)] transition-all"></span>
                                    {category.title}
                                </h3>
                                <ul className="space-y-1">
                                    {category.items.map((item, itemIndex) => {
                                        const Icon = item.icon;
                                        const isActive = activeView === item.view;
                                        return (
                                            <li key={item.view} style={{ animationDelay: `${(catIndex * 50) + (itemIndex * 30)}ms` }} className="animate-fade-in-left opacity-0 fill-mode-forwards">
                                                <button
                                                    onClick={() => handleItemClick(item.view)}
                                                    className={`w-full group flex items-center gap-4 p-3 rounded-xl text-left transition-all duration-300 border border-transparent ${
                                                        isActive 
                                                        ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(0,82,255,0.15)]' 
                                                        : 'hover:bg-white/5 hover:border-white/5 hover:translate-x-1'
                                                    }`}
                                                >
                                                    <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-300 ${
                                                        isActive ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                                                    }`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{item.label}</p>
                                                        <p className="text-[11px] text-slate-500 group-hover:text-slate-400">{item.description}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* User Footer */}
                    <div className="mt-auto p-8 border-t border-white/5 bg-slate-900/50 sticky bottom-0 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={userProfile.profilePictureUrl} alt="Profile" className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{userProfile.name}</p>
                                    <p className="text-xs text-slate-400 font-mono">Last login: {new Date(userProfile.lastLogin.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { handleItemClick('security'); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-bold border border-red-500/20"
                            >
                                <LogoutIcon className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dynamic Visual Context (Desktop Only) */}
                <div className="hidden md:block w-1/3 relative overflow-hidden border-l border-white/10">
                    {/* Dynamic Background Image */}
                    {Object.entries(CATEGORY_IMAGES).map(([key, url]) => (
                        <div 
                            key={key}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${hoveredCategory === key ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                            style={{ backgroundImage: `url(${url})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                        </div>
                    ))}

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-10 z-10">
                        <div className="mb-auto pt-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
                                <SparklesIcon className="w-3 h-3 text-yellow-400" />
                                <span>Featured</span>
                            </div>
                        </div>

                        <div className="animate-fade-in-up space-y-4">
                            <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
                                {hoveredCategory === 'Banking' && "Master Your Everyday Finances."}
                                {hoveredCategory === 'Payments' && "Global Reach, Instant Speed."}
                                {hoveredCategory === 'Wealth' && "Grow Your Portfolio Intelligently."}
                                {hoveredCategory === 'Lifestyle' && "Experience a World Without Borders."}
                                {hoveredCategory === 'Support' && "We Are Here For You, 24/7."}
                            </h1>
                            <p className="text-slate-300 text-sm leading-relaxed max-w-xs drop-shadow-md">
                                {hoveredCategory === 'Banking' && "Access premium checking, high-yield savings, and exclusive metal cards designed for the modern elite."}
                                {hoveredCategory === 'Payments' && "Send money to over 190 countries with real-time tracking and bank-beating exchange rates."}
                                {hoveredCategory === 'Wealth' && "Unlock access to global markets, crypto assets, and personalized AI-driven financial advice."}
                                {hoveredCategory === 'Lifestyle' && "Exclusive travel perks, concierge services, and seamless bill payments wherever you go."}
                                {hoveredCategory === 'Support' && "Bank-grade security protocols and priority support channels ensure your peace of mind."}
                            </p>
                            
                            <button className="mt-6 flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs hover:text-primary-300 transition-colors group">
                                <span>Explore {hoveredCategory}</span>
                                <div className="w-8 h-px bg-white group-hover:bg-primary-300 transition-colors"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                @keyframes fade-in-left {
                    0% { opacity: 0; transform: translateX(-10px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-left {
                    animation: fade-in-left 0.4s ease-out forwards;
                }
                .fill-mode-forwards {
                    animation-fill-mode: forwards;
                }
            `}</style>
        </>
    );
};
