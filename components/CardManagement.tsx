
import React, { useState, useMemo } from 'react';
import { Card, CardTransaction, SPENDING_CATEGORIES, VirtualCard } from '../types.ts';
import { 
    ICreditUnionLogo, 
    EyeIcon, 
    EyeSlashIcon, 
    LockClosedIcon, 
    PlusCircleIcon, 
    AppleWalletIcon, 
    VisaIcon, 
    MastercardIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ShoppingBagIcon, 
    TransportIcon, 
    FoodDrinkIcon, 
    EntertainmentIcon, 
    GlobeAmericasIcon, 
    Cog8ToothIcon, 
    PlusIcon, 
    PencilIcon,
    WifiIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    ArrowPathIcon
} from './Icons.tsx';
import { AddFundsModal } from './AddFundsModal.tsx';
import { AddCardModal } from './AddCardModal.tsx';
import { AdvancedCardControlsModal } from './AdvancedCardControlsModal.tsx';
import { CreateVirtualCardModal } from './CreateVirtualCardModal.tsx';

interface CardManagementProps {
    cards: Card[];
    virtualCards: VirtualCard[];
    onUpdateVirtualCard: (cardId: string, updates: Partial<VirtualCard>) => void;
    cardTransactions: CardTransaction[];
    onUpdateCardControls: (cardId: string, updatedControls: Partial<Card['controls']>) => void;
    onAddCard: (cardData: Omit<Card, 'id' | 'controls'>) => void;
    onAddVirtualCard: (data: { nickname: string; linkedCardId: string; spendingLimit: number | null }) => void;
    accountBalance: number;
    onAddFunds: (amount: number, cardLastFour: string, cardNetwork: 'Visa' | 'Mastercard') => Promise<void>;
}

const getCategoryIcon = (category: string, className: string): React.ReactElement => {
    const props = { className };
    switch (category) {
        case 'Shopping': return <ShoppingBagIcon {...props} />;
        case 'Food & Drink': return <FoodDrinkIcon {...props} />;
        case 'Entertainment': return <EntertainmentIcon {...props} />;
        case 'Transport': return <TransportIcon {...props} />;
        default: return <ShoppingBagIcon {...props} />;
    }
};

const EmvChip = () => (
    <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
        <rect width="40" height="30" rx="4" fill="#EAB308" fillOpacity="0.8"/>
        <path d="M0 10H10V0" stroke="#CA8A04" strokeWidth="1"/>
        <path d="M30 0V10H40" stroke="#CA8A04" strokeWidth="1"/>
        <path d="M10 10H30V20H10V10Z" stroke="#CA8A04" strokeWidth="1"/>
        <path d="M0 20H10V30" stroke="#CA8A04" strokeWidth="1"/>
        <path d="M30 30V20H40" stroke="#CA8A04" strokeWidth="1"/>
        <path d="M20 0V10" stroke="#CA8A04" strokeWidth="1"/>
        <path d="M20 20V30" stroke="#CA8A04" strokeWidth="1"/>
    </svg>
);

const PremiumCard: React.FC<{ card: Card }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Dynamic styling based on card type for a premium look
    const cardStyle = useMemo(() => {
        if (card.cardType === 'CREDIT') {
            return {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0f0f0f 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textColor: 'text-gray-200',
                labelColor: 'text-gray-400'
            };
        } else {
            return {
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                textColor: 'text-white',
                labelColor: 'text-slate-300'
            };
        }
    }, [card.cardType]);

    return (
        <div className="perspective-1000 w-full max-w-md mx-auto h-[240px] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT OF CARD */}
                <div 
                    className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden backface-hidden p-6 flex flex-col justify-between"
                    style={{ background: cardStyle.background, border: cardStyle.border }}
                >
                    {/* Texture Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <ICreditUnionLogo />
                            <span className={`font-bold tracking-widest uppercase text-xs ${cardStyle.labelColor}`}>
                                {card.cardType === 'CREDIT' ? 'Platinum Credit' : 'World Debit'}
                            </span>
                        </div>
                        <WifiIcon className={`w-6 h-6 ${cardStyle.textColor} opacity-70 rotate-90`} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 mt-2">
                        <EmvChip />
                        <div className={`text-xs font-mono ${cardStyle.textColor} opacity-60`}>
                            <WifiIcon className="w-4 h-4 inline-block mr-1" />
                            PayWave
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <p className={`font-mono text-2xl tracking-[0.15em] ${cardStyle.textColor} drop-shadow-md`}>
                            •••• •••• •••• {card.lastFour}
                        </p>
                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <p className={`text-[9px] uppercase tracking-wider ${cardStyle.labelColor} mb-0.5`}>Card Holder</p>
                                <p className={`font-medium uppercase tracking-wide text-sm ${cardStyle.textColor}`}>{card.cardholderName}</p>
                            </div>
                            <div>
                                <p className={`text-[9px] uppercase tracking-wider ${cardStyle.labelColor} mb-0.5 text-right`}>Expires</p>
                                <p className={`font-mono font-medium text-sm ${cardStyle.textColor}`}>{card.expiryDate}</p>
                            </div>
                            <div className="w-12">
                                {card.network === 'Visa' ? <VisaIcon className="w-full h-auto" /> : <MastercardIcon className="w-full h-auto" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK OF CARD */}
                <div 
                    className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden backface-hidden rotate-y-180 bg-slate-800"
                    style={{ background: '#1a1a1a' }} // Solid dark back
                >
                    <div className="w-full h-12 bg-black mt-6 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')] opacity-30"></div>
                    </div>
                    
                    <div className="p-6 relative">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-slate-400 max-w-[60%] leading-tight">
                                Authorized signature - not valid unless signed. This card is property of iCredit Union®.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="h-10 flex-grow bg-white/90 rounded flex items-center px-3 overflow-hidden">
                                <span className="font-handwriting text-slate-800 text-lg transform -rotate-2 ml-2">
                                    {card.cardholderName}
                                </span>
                            </div>
                            <div className="h-10 w-16 bg-white/90 rounded flex items-center justify-center border-2 border-red-500/50">
                                <span className="font-mono font-bold text-slate-900 italic">{card.cvc}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between items-end">
                            <div className="text-slate-400 text-[10px]">
                                <p>Support: +1 (800) 555-0199</p>
                                <p>International: +1 (212) 555-0187</p>
                            </div>
                            <ICreditUnionLogo />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Status Indicator */}
            <div className={`absolute top-4 right-4 z-20 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md transition-colors duration-300 ${card.controls.isFrozen ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                {card.controls.isFrozen ? 'Frozen' : 'Active'}
            </div>
            
            <div className="absolute -bottom-12 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-400 text-xs flex items-center justify-center gap-2">
                <ArrowPathIcon className="w-3 h-3" />
                Tap card to flip
            </div>
        </div>
    );
};

const TransactionRow: React.FC<{ transaction: CardTransaction }> = ({ transaction }) => {
    return (
        <li className="flex items-center justify-between py-4 border-b border-slate-200/5 last:border-0 group hover:bg-white/5 transition-colors px-2 rounded-lg -mx-2">
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center shadow-inner border border-white/5 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                    {getCategoryIcon(transaction.category, "w-5 h-5")}
                </div>
                <div>
                    <p className="font-semibold text-slate-200 text-sm group-hover:text-white transition-colors">{transaction.description}</p>
                    <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString()} • {transaction.category}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-slate-200 font-mono text-sm">
                    -{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                {transaction.status === 'Pending' && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-medium">Pending</span>}
            </div>
        </li>
    );
};

const ControlTile: React.FC<{ label: string; icon: React.ReactNode; active: boolean; onClick: () => void; color?: string }> = ({ label, icon, active, onClick, color = 'bg-primary' }) => (
    <button 
        onClick={onClick}
        className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group ${active ? 'bg-slate-800 border-white/10 shadow-inner' : 'bg-slate-800/40 border-white/5 hover:bg-slate-800 hover:border-white/10'}`}
    >
        <div className={`p-2.5 rounded-full transition-all duration-300 ${active ? `${color} text-white shadow-lg scale-110` : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-200'}`}>
            {icon}
        </div>
        <span className={`text-xs font-medium ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{label}</span>
        {active && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${color}`}></div>}
    </button>
);

export const CardManagement: React.FC<CardManagementProps> = ({ cards, virtualCards, onUpdateVirtualCard, cardTransactions, onUpdateCardControls, onAddCard, onAddVirtualCard, onAddFunds }) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [isCreateVirtualCardModalOpen, setIsCreateVirtualCardModalOpen] = useState(false);
    const [advancedControlsCard, setAdvancedControlsCard] = useState<Card | null>(null);
    
    const currentCard = cards[currentCardIndex];
    
    const handleNext = () => setCurrentCardIndex(prev => (prev + 1) % cards.length);
    const handlePrev = () => setCurrentCardIndex(prev => (prev - 1 + cards.length) % cards.length);

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cards & Digital Wallet</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your physical and virtual cards securely.</p>
                </div>
                <button 
                    onClick={() => setIsAddCardModalOpen(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="font-medium text-sm">Add New Card</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Card & Controls */}
                <div className="lg:col-span-5 space-y-8">
                    
                    {/* Card Carousel Container */}
                    <div className="relative perspective-1000 py-4">
                        {cards.length > 0 ? (
                            <>
                                <PremiumCard card={currentCard} />
                                {cards.length > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-8">
                                        <button onClick={handlePrev} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-white/5 transition-all"><ChevronLeftIcon className="w-5 h-5" /></button>
                                        <div className="flex gap-2">
                                            {cards.map((_, i) => (
                                                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentCardIndex ? 'bg-primary w-4' : 'bg-slate-700'}`}></div>
                                            ))}
                                        </div>
                                        <button onClick={handleNext} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-white/5 transition-all"><ChevronRightIcon className="w-5 h-5" /></button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div onClick={() => setIsAddCardModalOpen(true)} className="w-full max-w-md mx-auto h-[240px] rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                <PlusCircleIcon className="w-12 h-12 mb-2 opacity-50" />
                                <span className="font-semibold">Add Your First Card</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Controls Grid */}
                    {currentCard && (
                        <div className="grid grid-cols-4 gap-3">
                            <ControlTile 
                                label={currentCard.controls.isFrozen ? "Unlock" : "Lock"} 
                                icon={currentCard.controls.isFrozen ? <LockClosedIcon className="w-5 h-5"/> : <ShieldCheckIcon className="w-5 h-5"/>} 
                                active={currentCard.controls.isFrozen} 
                                onClick={() => onUpdateCardControls(currentCard.id, { isFrozen: !currentCard.controls.isFrozen })} 
                                color="bg-red-500"
                            />
                            <ControlTile 
                                label="Settings" 
                                icon={<Cog8ToothIcon className="w-5 h-5"/>} 
                                active={false} 
                                onClick={() => setAdvancedControlsCard(currentCard)} 
                            />
                            <ControlTile 
                                label="Add Funds" 
                                icon={<PlusCircleIcon className="w-5 h-5"/>} 
                                active={false} 
                                onClick={() => setIsAddFundsModalOpen(true)} 
                            />
                            <ControlTile 
                                label="Pin" 
                                icon={<EyeIcon className="w-5 h-5"/>} 
                                active={false} 
                                onClick={() => alert('PIN View Simulation: 1234')} 
                            />
                        </div>
                    )}

                    {/* Apple Wallet CTA */}
                    <button className="w-full py-3 bg-black hover:bg-slate-900 text-white rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all duration-300 group border border-slate-800">
                        <AppleWalletIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Add to Apple Wallet</span>
                    </button>

                </div>

                {/* Right Column: Insights & History */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Spending Insights Widget */}
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Monthly Spending</h3>
                            <span className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded">USD</span>
                        </div>
                        
                        <div className="flex items-end gap-2 h-24 mb-4 px-2">
                            {SPENDING_CATEGORIES.slice(0, 6).map((cat, i) => {
                                const height = Math.max(20, Math.random() * 100);
                                return (
                                    <div key={cat} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full bg-slate-700/30 rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-slate-700/50" style={{ height: `${height}%` }}>
                                            <div className={`absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-t ${i % 2 === 0 ? 'from-primary/40' : 'from-blue-400/40'} to-transparent opacity-50 group-hover:opacity-80 transition-opacity`}></div>
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate w-full text-center">{cat.split(' ')[0]}</div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-200">Spending on track</p>
                                    <p className="text-xs text-slate-500">You're $120 under your monthly average.</p>
                                </div>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-xl min-h-[300px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                            <button className="text-xs font-semibold text-primary hover:text-primary-300 transition-colors">View All</button>
                        </div>
                        
                        {cardTransactions.length > 0 ? (
                            <ul className="space-y-1">
                                {cardTransactions.slice(0, 5).map(tx => (
                                    <TransactionRow key={tx.id} transaction={tx} />
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>No recent transactions.</p>
                            </div>
                        )}
                    </div>

                    {/* Virtual Cards Section */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <WifiIcon className="w-32 h-32 text-white rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Virtual Cards</h3>
                                <button onClick={() => setIsCreateVirtualCardModalOpen(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {virtualCards.map(vc => (
                                    <div key={vc.id} className="flex-shrink-0 w-64 h-36 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-4 border border-white/10 shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-transform hover:scale-105">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20"></div>
                                        <div className="relative z-10 flex justify-between items-start">
                                            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">{vc.nickname}</span>
                                            <VisaIcon className="w-10 h-auto opacity-80" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="font-mono text-lg text-white tracking-widest">•••• {vc.lastFour}</p>
                                            <div className="flex justify-between items-end mt-2">
                                                <p className="text-[10px] text-purple-300">Virtual</p>
                                                <p className="text-[10px] text-purple-300">Exp {vc.expiryDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {virtualCards.length === 0 && (
                                    <p className="text-sm text-slate-400">Create a virtual card for secure online shopping.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            {isAddFundsModalOpen && (
                <AddFundsModal 
                    onClose={() => setIsAddFundsModalOpen(false)}
                    onAddFunds={async (amount, lastFour, network) => {
                        await onAddFunds(amount, lastFour, network);
                        setIsAddFundsModalOpen(false);
                    }}
                />
            )}
            {isAddCardModalOpen && (
                <AddCardModal 
                    onClose={() => setIsAddCardModalOpen(false)}
                    onAddCard={(cardData) => {
                        onAddCard(cardData);
                        setIsAddCardModalOpen(false);
                    }}
                />
            )}
            {isCreateVirtualCardModalOpen && (
                <CreateVirtualCardModal
                    physicalCards={cards}
                    onClose={() => setIsCreateVirtualCardModalOpen(false)}
                    onAddVirtualCard={onAddVirtualCard}
                />
            )}
            {advancedControlsCard && (
                <AdvancedCardControlsModal
                    card={advancedControlsCard}
                    onClose={() => setAdvancedControlsCard(null)}
                    onSave={(updatedControls) => {
                        onUpdateCardControls(advancedControlsCard.id, updatedControls);
                        setAdvancedControlsCard(null);
                    }}
                />
            )}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .font-handwriting { font-family: 'Brush Script MT', cursive; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
