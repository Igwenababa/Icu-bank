
import React, { useState, useMemo } from 'react';
import { 
    XIcon, 
    SearchIcon, 
    BankIcon, 
    CheckCircleIcon, 
    SpinnerIcon, 
    ShieldCheckIcon, 
    LockClosedIcon,
    GlobeAmericasIcon,
    getBankIcon,
    getServiceIcon
} from './Icons.tsx';

interface AddNewMethodModalProps {
    onClose: () => void;
    onAdd: (methodId: string, name: string, type: 'BANK' | 'SERVICE') => void;
}

const FEATURED_BANKS = [
    "Chase Bank", "Bank of America", "Wells Fargo", "Citibank", "Capital One", "US Bank", "PNC Bank", "TD Bank"
];

const FEATURED_SERVICES = [
    "PayPal", "CashApp", "Zelle", "Venmo", "Wise", "Revolut", "Western Union", "MoneyGram"
];

export const AddNewMethodModal: React.FC<AddNewMethodModalProps> = ({ onClose, onAdd }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | 'BANKS' | 'SERVICES'>('ALL');
    const [addingMethod, setAddingMethod] = useState<string | null>(null);
    const [connectionStep, setConnectionStep] = useState(0);

    const filteredMethods = useMemo(() => {
        const term = searchTerm.toLowerCase();
        const methods = [];

        if (activeTab === 'ALL' || activeTab === 'BANKS') {
            FEATURED_BANKS.forEach(bank => {
                if (bank.toLowerCase().includes(term)) {
                    methods.push({ id: bank, name: bank, type: 'BANK' as const });
                }
            });
        }

        if (activeTab === 'ALL' || activeTab === 'SERVICES') {
            FEATURED_SERVICES.forEach(service => {
                if (service.toLowerCase().includes(term)) {
                    methods.push({ id: service, name: service, type: 'SERVICE' as const });
                }
            });
        }

        return methods;
    }, [searchTerm, activeTab]);

    const handleSelect = (method: { id: string, name: string, type: 'BANK' | 'SERVICE' }) => {
        setAddingMethod(method.name);
        setConnectionStep(1);

        // Simulate sophisticated connection process
        setTimeout(() => setConnectionStep(2), 1500); // Verifying
        setTimeout(() => setConnectionStep(3), 3000); // Securing
        setTimeout(() => {
            onAdd(method.id, method.name, method.type);
            onClose();
        }, 4500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-fade-in-up relative">
                
                {/* Loading Overlay */}
                {addingMethod && (
                    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShieldCheckIcon className="w-10 h-10 text-primary animate-pulse" />
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">Connecting to {addingMethod}</h3>
                        <div className="h-6">
                            {connectionStep === 1 && <p className="text-slate-400 animate-fade-in">Initiating secure handshake (TLS 1.3)...</p>}
                            {connectionStep === 2 && <p className="text-slate-400 animate-fade-in">Verifying API compatibility & compliance...</p>}
                            {connectionStep === 3 && <p className="text-green-400 animate-fade-in flex items-center justify-center gap-2"><CheckCircleIcon className="w-4 h-4"/> Connection Established</p>}
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-slate-800/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Add Payment Method</h2>
                        <p className="text-slate-400 text-sm">Connect a new bank or service instantly.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="p-6 border-b border-white/10 bg-slate-900/80 sticky top-0 z-10">
                    <div className="relative mb-6">
                        <SearchIcon className="w-5 h-5 text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search banks, wallets, services..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-inner text-lg"
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {['ALL', 'BANKS', 'SERVICES'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                    activeTab === tab 
                                    ? 'bg-white text-slate-900 border-white' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-grow overflow-y-auto p-6 bg-slate-950/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredMethods.map(method => {
                            const Icon = method.type === 'BANK' ? getBankIcon(method.name) : getServiceIcon(method.name);
                            
                            return (
                                <button
                                    key={method.name}
                                    onClick={() => handleSelect(method)}
                                    className="group flex flex-col items-center justify-center p-6 bg-slate-800/40 border border-white/5 rounded-2xl hover:bg-slate-800 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,82,255,0.15)] transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-8 h-8 object-contain" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white text-center">{method.name}</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{method.type === 'BANK' ? 'Bank' : 'Service'}</span>
                                    
                                    {/* Verification Badge on Hover */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GlobeAmericasIcon className="w-4 h-4 text-primary" />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                    
                    {filteredMethods.length === 0 && (
                        <div className="text-center py-20">
                            <SearchIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500">No payment methods found matching "{searchTerm}".</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-slate-900 flex justify-between items-center text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <LockClosedIcon className="w-3 h-3" />
                        <span>End-to-end Encrypted</span>
                    </div>
                    <p>Powered by iCredit Global Network</p>
                </div>
            </div>
        </div>
    );
};
