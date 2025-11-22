
import React, { useState, useEffect } from 'react';
import { ArrowRightIcon, GlobeAmericasIcon, ShieldCheckIcon, TrendingUpIcon, BuildingOfficeIcon, StarIcon } from './Icons';

interface AdvancedFirstPageProps {
    onComplete: () => void;
    onOpenAccount: () => void;
}

const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2940&auto=format&fit=crop", // Original London Night
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940&auto=format&fit=crop", // Modern Corporate Skyscraper
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", // Global Network/Tech
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop"  // Premium Meeting/Lifestyle
];

const MarketTicker = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-t border-white/10 py-3 overflow-hidden z-30">
        <div className="flex items-center animate-marquee whitespace-nowrap">
            <div className="flex space-x-12 px-4">
                {[
                    { label: "S&P 500", val: "5,245.12", change: "+0.45%", up: true },
                    { label: "NASDAQ", val: "16,428.82", change: "+0.82%", up: true },
                    { label: "EUR/USD", val: "1.0842", change: "-0.12%", up: false },
                    { label: "GBP/USD", val: "1.2635", change: "+0.05%", up: true },
                    { label: "BTC/USD", val: "68,420.00", change: "+1.24%", up: true },
                    { label: "Gold", val: "2,345.50", change: "+0.30%", up: true },
                    { label: "Oil (WTI)", val: "82.15", change: "-0.45%", up: false },
                    { label: "JPY/USD", val: "151.40", change: "+0.15%", up: true },
                ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-sm font-mono tracking-tight">
                        <span className="text-slate-400 font-bold">{item.label}</span>
                        <span className="text-white">{item.val}</span>
                        <span className={`flex items-center ${item.up ? "text-emerald-400" : "text-red-400"}`}>
                            <span className="mr-1">{item.up ? '▲' : '▼'}</span> {item.change}
                        </span>
                    </div>
                ))}
                 {/* Repeat for seamless loop */}
                 {[
                    { label: "S&P 500", val: "5,245.12", change: "+0.45%", up: true },
                    { label: "NASDAQ", val: "16,428.82", change: "+0.82%", up: true },
                    { label: "EUR/USD", val: "1.0842", change: "-0.12%", up: false },
                    { label: "GBP/USD", val: "1.2635", change: "+0.05%", up: true },
                    { label: "BTC/USD", val: "68,420.00", change: "+1.24%", up: true },
                ].map((item, i) => (
                    <div key={`dup-${i}`} className="flex items-center space-x-3 text-sm font-mono tracking-tight">
                        <span className="text-slate-400 font-bold">{item.label}</span>
                        <span className="text-white">{item.val}</span>
                        <span className={`flex items-center ${item.up ? "text-emerald-400" : "text-red-400"}`}>
                            <span className="mr-1">{item.up ? '▲' : '▼'}</span> {item.change}
                        </span>
                    </div>
                ))}
            </div>
        </div>
         <style>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-marquee {
                animation: marquee 40s linear infinite;
            }
        `}</style>
    </div>
);

export const AdvancedFirstPage: React.FC<AdvancedFirstPageProps> = ({ onComplete, onOpenAccount }) => {
    const [bgIndex, setBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
        }, 6000); // Change image every 6 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
            
            {/* Dynamic Background Slider */}
            {BACKGROUND_IMAGES.map((img, index) => (
                <div 
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img
                        src={img}
                        alt="Background"
                        className={`absolute inset-0 w-full h-full object-cover ${index === bgIndex ? 'animate-ken-burns' : ''}`}
                    />
                </div>
            ))}

            {/* Sophisticated Overlay */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/90"></div>
            <div className="absolute inset-0 z-[1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

            {/* Navigation Bar Simulation */}
            <div className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded flex items-center justify-center">
                        <span className="font-serif font-bold text-xl text-white">i</span>
                    </div>
                    <span className="font-bold tracking-[0.2em] text-xs uppercase text-white/80">iCredit Union</span>
                </div>
                <div className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-widest text-white/70">
                    <span onClick={onComplete} className="hover:text-white cursor-pointer transition-colors">Private Banking</span>
                    <span onClick={onComplete} className="hover:text-white cursor-pointer transition-colors">Corporate</span>
                    <span onClick={onComplete} className="hover:text-white cursor-pointer transition-colors">Wealth Management</span>
                </div>
                <button onClick={onComplete} className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider transition-all">
                    Client Login
                </button>
            </div>

            {/* Main Content - Glassmorphic Card */}
            <div className="relative z-20 w-full max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-12">
                
                {/* Left Text Content */}
                <div className="text-left md:w-3/5 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                        <StarIcon className="w-3 h-3" />
                        <span>Global Excellence Award 2024</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 drop-shadow-2xl leading-[1.1]">
                        Wealth Beyond <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-200">Boundaries.</span>
                    </h1>

                    <p className="text-lg text-slate-200 max-w-xl mb-10 leading-relaxed font-light border-l-2 border-white/20 pl-6">
                        Experience the pinnacle of global finance. Secure, seamless, and tailored for the modern investor. Access your portfolio from anywhere in the world.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={onComplete}
                            className="group relative px-8 py-4 bg-white text-slate-900 rounded-none rounded-tr-2xl rounded-bl-2xl font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-500 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Access Portal <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                        
                        <button 
                            onClick={onOpenAccount}
                            className="px-8 py-4 bg-transparent border border-white/30 hover:bg-white/5 text-white rounded-none rounded-tr-2xl rounded-bl-2xl font-bold text-sm uppercase tracking-wider backdrop-blur-sm transition-all duration-300 flex items-center gap-2 group"
                        >
                            <span>Open Account</span>
                        </button>
                    </div>
                </div>

                {/* Right Stats/Features (Desktop Only) */}
                <div className="hidden md:block md:w-2/5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Bank-Grade Security</h3>
                                    <p className="text-xs text-slate-400">AES-256 Encryption</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <GlobeAmericasIcon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Global Reach</h3>
                                    <p className="text-xs text-slate-400">190+ Countries Supported</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <TrendingUpIcon className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Wealth Management</h3>
                                    <p className="text-xs text-slate-400">AI-Driven Insights</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Assets Secured</p>
                            <p className="text-3xl font-mono font-bold text-white">$50B+</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Market Ticker */}
            <MarketTicker />
        </div>
    );
};
