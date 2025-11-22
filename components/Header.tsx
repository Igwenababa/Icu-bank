
import React, { useState, useEffect, useRef } from 'react';
import { 
    MenuIcon, BellIcon, GlobeAmericasIcon, SearchIcon, XIcon, ShieldCheckIcon
} from './Icons.tsx';
import { Notification, View, UserProfile } from '../types.ts';
import { MegaMenu } from './MegaMenu.tsx';
import { NotificationsPanel } from './NotificationsPanel.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { ProfileDropdown } from './ProfileDropdown.tsx';
import { CURRENCIES_LIST } from '../constants.ts';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  onNotificationClick: (view: View) => void;
  userProfile: UserProfile;
  onOpenLanguageSelector: () => void;
  onUpdateProfilePicture: (url: string) => void;
  onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
  onOpenWireTransfer: () => void;
  displayCurrency?: string;
  setDisplayCurrency?: (currency: string) => void;
}

const MarketTicker = () => (
    <div className="bg-slate-950 text-slate-400 text-[10px] py-1.5 overflow-hidden border-b border-white/5 relative z-50">
        <div className="flex items-center animate-marquee whitespace-nowrap">
            <div className="flex space-x-8 px-4">
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">S&P 500</span> 5,245.12 <span className="text-green-400 ml-1">▲ 0.45%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">NASDAQ</span> 16,428.82 <span className="text-green-400 ml-1">▲ 0.82%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">EUR/USD</span> 1.0842 <span className="text-red-400 ml-1">▼ 0.12%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">GBP/USD</span> 1.2635 <span className="text-green-400 ml-1">▲ 0.05%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">Gold</span> 2,345.50 <span className="text-green-400 ml-1">▲ 0.30%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">Oil (WTI)</span> 82.15 <span className="text-red-400 ml-1">▼ 0.45%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">BTC/USD</span> 68,420.00 <span className="text-green-400 ml-1">▲ 1.24%</span></span>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex space-x-8 px-4">
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">S&P 500</span> 5,245.12 <span className="text-green-400 ml-1">▲ 0.45%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">NASDAQ</span> 16,428.82 <span className="text-green-400 ml-1">▲ 0.82%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">EUR/USD</span> 1.0842 <span className="text-red-400 ml-1">▼ 0.12%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">GBP/USD</span> 1.2635 <span className="text-green-400 ml-1">▲ 0.05%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">Gold</span> 2,345.50 <span className="text-green-400 ml-1">▲ 0.30%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">Oil (WTI)</span> 82.15 <span className="text-red-400 ml-1">▼ 0.45%</span></span>
                <span className="flex items-center"><span className="font-bold text-slate-200 mr-1">BTC/USD</span> 68,420.00 <span className="text-green-400 ml-1">▲ 1.24%</span></span>
            </div>
        </div>
    </div>
);

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen, activeView, setActiveView, onLogout, notifications, onMarkNotificationsAsRead, onNotificationClick, userProfile, onOpenLanguageSelector, onUpdateProfilePicture, onOpenSendMoneyFlow, onOpenWireTransfer, displayCurrency = 'USD', setDisplayCurrency }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Common currencies for quick access
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];
  const currencyOptions = CURRENCIES_LIST.filter(c => popularCurrencies.includes(c.code));

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleNotifications = () => {
      setShowNotifications(prev => !prev);
      if (!showNotifications) {
          onMarkNotificationsAsRead();
      }
  }

  const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
  }

  useOutsideAlerter(notificationsRef, () => setShowNotifications(false));
  useOutsideAlerter(profileDropdownRef, () => setIsProfileDropdownOpen(false));
  useOutsideAlerter(currencyDropdownRef, () => setIsCurrencyDropdownOpen(false));

  const handleProfileNavigate = (view: View) => {
      setActiveView(view);
      setIsProfileDropdownOpen(false);
  }

  const handleProfileLogout = () => {
      onLogout();
      setIsProfileDropdownOpen(false);
  }

  const iconButtonClasses = "relative p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-all duration-300 active:scale-95";

  return (
    <>
      <MarketTicker />
      <header 
        className={`sticky top-0 z-40 w-full border-b transition-all duration-500 ${
            isScrolled 
            ? 'bg-slate-900/90 backdrop-blur-xl border-white/10 shadow-lg' 
            : 'bg-slate-900 border-transparent'
        }`}
      >
        {/* Abstract Background Glow for Premium Feel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[100px] left-1/4 w-[500px] h-[100px] bg-primary/20 blur-[100px] rounded-full opacity-40"></div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex justify-between items-center h-20">
                
                {/* Left: Brand & Menu */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={onMenuToggle}
                        className={`${iconButtonClasses} ring-1 ring-white/5`}
                        aria-label="Open menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('dashboard')}>
                        {/* Logo simulation */}
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-900 rounded-xl flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300">
                            <span className="font-serif font-bold text-white text-xl">i</span>
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-lg font-bold text-white tracking-tight leading-none">iCredit Union®</h1>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Private Banking</p>
                        </div>
                    </div>
                </div>

                {/* Center: Omni-Search */}
                <div className={`hidden md:flex items-center transition-all duration-500 ease-out ${isSearchExpanded ? 'flex-grow max-w-2xl mx-8' : 'w-64 mx-4'}`}>
                    <div className={`relative w-full group ${isSearchExpanded ? 'scale-100' : 'scale-100'}`}>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className={`w-5 h-5 transition-colors ${isSearchExpanded ? 'text-primary' : 'text-slate-500'}`} />
                        </div>
                        <input 
                            type="text" 
                            className={`block w-full bg-slate-800/50 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-slate-800 transition-all duration-300 ${isSearchExpanded ? 'shadow-[0_0_20px_rgba(0,82,255,0.15)]' : 'hover:bg-slate-800/80'}`}
                            placeholder={t('chat_placeholder') || "Search transactions, help, or services..."}
                            onFocus={() => setIsSearchExpanded(true)}
                            onBlur={() => setIsSearchExpanded(false)}
                        />
                        {isSearchExpanded && (
                            <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white">
                                <XIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Right: Actions */}
                <div className="flex items-center gap-3 sm:gap-5">
                    {/* Mobile Search Trigger */}
                    <button className="md:hidden p-2 text-slate-400 hover:text-white">
                        <SearchIcon className="w-6 h-6" />
                    </button>

                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

                    {/* Currency Selector */}
                    <div className="relative hidden sm:block" ref={currencyDropdownRef}>
                        <button
                            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                            className={`${iconButtonClasses} flex items-center gap-1 hover:bg-white/10 px-3`}
                            title="Select Currency"
                        >
                            <span className="text-xs font-bold text-slate-300">{displayCurrency}</span>
                        </button>
                        
                        {isCurrencyDropdownOpen && setDisplayCurrency && (
                            <div className="absolute top-full right-0 mt-2 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-down z-50">
                                {currencyOptions.map(c => (
                                    <button
                                        key={c.code}
                                        onClick={() => { setDisplayCurrency(c.code); setIsCurrencyDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center justify-between ${displayCurrency === c.code ? 'text-primary bg-primary/5' : 'text-slate-300'}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <img src={`https://flagsapi.com/${c.countryCode}/shiny/16.png`} alt={c.name} className="w-4 h-auto" />
                                            {c.code}
                                        </span>
                                        {displayCurrency === c.code && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onOpenLanguageSelector}
                        className={`${iconButtonClasses} hidden sm:block`}
                        title="Language"
                    >
                        <GlobeAmericasIcon className="w-6 h-6" />
                    </button>

                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={toggleNotifications}
                            className={iconButtonClasses}
                            aria-label="Notifications"
                        >
                            <BellIcon className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-slate-900 text-[9px] font-bold text-white animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} onNotificationClick={onNotificationClick} />}
                    </div>

                    <div className="relative" ref={profileDropdownRef}>
                        <button 
                            onClick={() => setIsProfileDropdownOpen(prev => !prev)} 
                            className="flex items-center gap-3 focus:outline-none group pl-2"
                            aria-haspopup="true"
                            aria-expanded={isProfileDropdownOpen}
                        >
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary-500 to-green-400 rounded-full opacity-75 group-hover:opacity-100 blur-[2px] transition-opacity"></div>
                                <img src={userProfile.profilePictureUrl} alt="User Profile" className="relative w-10 h-10 rounded-full object-cover border-2 border-slate-900" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" title="Secure Session Active"></div>
                            </div>
                            <div className="hidden xl:block text-left">
                                <p className="text-xs font-bold text-white group-hover:text-primary-300 transition-colors">{userProfile.name}</p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <ShieldCheckIcon className="w-3 h-3 text-green-500" /> Verified
                                </p>
                            </div>
                        </button>

                        {isProfileDropdownOpen && (
                            <ProfileDropdown 
                                userProfile={userProfile}
                                onNavigate={handleProfileNavigate}
                                onLogout={handleProfileLogout}
                                onUpdateProfilePicture={onUpdateProfilePicture}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
      </header>
      <MegaMenu
        isOpen={isMenuOpen}
        onClose={onMenuToggle}
        activeView={activeView}
        setActiveView={setActiveView}
        userProfile={userProfile}
        onOpenSendMoneyFlow={onOpenSendMoneyFlow}
        onOpenWireTransfer={onOpenWireTransfer}
      />
    </>
  );
};
