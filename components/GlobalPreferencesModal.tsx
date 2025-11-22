
import React, { useState, useMemo } from 'react';
import { EXTENDED_LANGUAGES, CURRENCIES_LIST } from '../constants';
import { XIcon, SearchIcon, GlobeAmericasIcon, CurrencyDollarIcon, MapPinIcon, CheckCircleIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface GlobalPreferencesModalProps {
    onClose: () => void;
    currentCurrency: string;
    setCurrency: (currency: string) => void;
}

type Tab = 'language' | 'currency' | 'region';

export const GlobalPreferencesModal: React.FC<GlobalPreferencesModalProps> = ({ onClose, currentCurrency, setCurrency }) => {
    const { language, setLanguage } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('language');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('US'); // Default Region preference

    const filteredLanguages = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return EXTENDED_LANGUAGES.filter(l => 
            l.name.toLowerCase().includes(term) || 
            l.nativeName.toLowerCase().includes(term) ||
            l.code.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    const filteredCurrencies = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return CURRENCIES_LIST.filter(c => 
            c.code.toLowerCase().includes(term) || 
            c.name.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    const handleLanguageSelect = (code: string) => {
        setLanguage(code);
        // Optional: Auto-close or show success
    };

    const handleCurrencySelect = (code: string) => {
        setCurrency(code);
        // Optional: Auto-close
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="flex-shrink-0 p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Global Preferences</h2>
                        <p className="text-slate-400 text-sm">Customize your regional experience.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="flex-shrink-0 bg-slate-800/50">
                    <div className="flex border-b border-white/5">
                        <button 
                            onClick={() => { setActiveTab('language'); setSearchTerm(''); }}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'language' ? 'text-primary bg-white/5 border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                        >
                            <GlobeAmericasIcon className="w-4 h-4" /> Language
                        </button>
                        <button 
                            onClick={() => { setActiveTab('currency'); setSearchTerm(''); }}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'currency' ? 'text-primary bg-white/5 border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                        >
                            <CurrencyDollarIcon className="w-4 h-4" /> Currency
                        </button>
                        <button 
                            onClick={() => { setActiveTab('region'); setSearchTerm(''); }}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'region' ? 'text-primary bg-white/5 border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                        >
                            <MapPinIcon className="w-4 h-4" /> Region
                        </button>
                    </div>
                    
                    {activeTab !== 'region' && (
                        <div className="p-4 border-b border-white/5 relative">
                            <SearchIcon className="w-5 h-5 text-slate-500 absolute top-1/2 left-7 -translate-y-1/2" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full bg-slate-950 border border-white/10 text-white p-3 pl-12 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
                    
                    {activeTab === 'language' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                            {filteredLanguages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${language === lang.code ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(0,82,255,0.1)]' : 'bg-slate-800/30 border-white/5 hover:bg-slate-800 hover:border-white/20'}`}
                                >
                                    <img 
                                        src={`https://flagsapi.com/${lang.countryCode}/shiny/64.png`} 
                                        alt={lang.name} 
                                        className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-110"
                                    />
                                    <div className="text-left">
                                        <p className={`font-bold ${language === lang.code ? 'text-white' : 'text-slate-300'}`}>{lang.nativeName}</p>
                                        <p className="text-xs text-slate-500">{lang.name}</p>
                                    </div>
                                    {language === lang.code && <CheckCircleIcon className="w-6 h-6 text-primary ml-auto" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'currency' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                            {filteredCurrencies.map(curr => (
                                <button
                                    key={curr.code}
                                    onClick={() => handleCurrencySelect(curr.code)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${currentCurrency === curr.code ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800/30 border-white/5 hover:bg-slate-800 hover:border-white/20'}`}
                                >
                                    <img 
                                        src={`https://flagsapi.com/${curr.countryCode}/shiny/64.png`} 
                                        alt={curr.name} 
                                        className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-110"
                                    />
                                    <div className="text-left">
                                        <p className={`font-bold font-mono ${currentCurrency === curr.code ? 'text-white' : 'text-slate-300'}`}>{curr.code}</p>
                                        <p className="text-xs text-slate-500">{curr.name}</p>
                                    </div>
                                    {currentCurrency === curr.code && <CheckCircleIcon className="w-6 h-6 text-emerald-500 ml-auto" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'region' && (
                        <div className="p-6 space-y-8">
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                                <h3 className="font-bold text-white mb-4">Regional Formatting</h3>
                                <p className="text-sm text-slate-400 mb-6">
                                    Adjust how dates, numbers, and time are displayed across the application.
                                </p>
                                
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center">
                                                {selectedRegion === 'US' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">United States (MM/DD/YYYY)</p>
                                                <p className="text-xs text-slate-500">1,234.56 • 12-Hour Clock</p>
                                            </div>
                                        </div>
                                        <input type="radio" name="region" className="hidden" checked={selectedRegion === 'US'} onChange={() => setSelectedRegion('US')} />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center">
                                                {selectedRegion === 'EU' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Europe (DD.MM.YYYY)</p>
                                                <p className="text-xs text-slate-500">1.234,56 • 24-Hour Clock</p>
                                            </div>
                                        </div>
                                        <input type="radio" name="region" className="hidden" checked={selectedRegion === 'EU'} onChange={() => setSelectedRegion('EU')} />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center">
                                                {selectedRegion === 'ISO' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">International (YYYY-MM-DD)</p>
                                                <p className="text-xs text-slate-500">1 234.56 • ISO 8601</p>
                                            </div>
                                        </div>
                                        <input type="radio" name="region" className="hidden" checked={selectedRegion === 'ISO'} onChange={() => setSelectedRegion('ISO')} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                
                <div className="p-6 border-t border-white/10 bg-slate-900 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
