
import React, { useState, useMemo } from 'react';
import { EXCHANGE_RATES, CURRENCIES_LIST } from '../constants';
import { ArrowsRightLeftIcon, SpinnerIcon, TrendingUpIcon, GlobeAmericasIcon } from './Icons';

// Helper for SVG Sparkline
const Sparkline: React.FC<{ color: string }> = ({ color }) => {
    const points = useMemo(() => {
        let data = [50];
        for(let i=0; i<20; i++) {
            data.push(data[data.length-1] + (Math.random() - 0.5) * 10);
        }
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        return data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ');
    }, [color]); // Dependency added although mostly static for this demo

    return (
        <svg viewBox="0 0 100 100" className="w-full h-12 opacity-50" preserveAspectRatio="none">
            <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
        </svg>
    );
};

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  const fromInfo = CURRENCIES_LIST.find(c => c.code === fromCurrency);
  const toInfo = CURRENCIES_LIST.find(c => c.code === toCurrency);

  const { convertedAmount, exchangeRate } = useMemo(() => {
    const numericAmount = parseFloat(amount) || 0;
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES[toCurrency] || 1;

    // Convert to base (USD) then to target
    const amountInBase = numericAmount / fromRate;
    const finalAmount = amountInBase * toRate;
    const directRate = (1 / fromRate) * toRate;

    return { convertedAmount: finalAmount, exchangeRate: directRate };
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-digital border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10">
            <GlobeAmericasIcon className="w-32 h-32 text-white" />
        </div>

        <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-primary" />
                Real-Time FX
            </h2>
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Market Open</span>
            </div>
        </div>

        <div className="p-6 relative z-10">
            <div className="flex flex-col gap-4">
                {/* FROM Input */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group focus-within:border-primary/50 transition-colors">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Selling</p>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="bg-transparent text-3xl font-bold text-white outline-none w-48 placeholder-slate-600"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-lg font-bold text-white">{fromCurrency}</p>
                            <p className="text-xs text-slate-500">{fromInfo?.name}</p>
                        </div>
                        <div className="relative w-12 h-12">
                            <select 
                                value={fromCurrency} 
                                onChange={(e) => setFromCurrency(e.target.value)} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            >
                                {CURRENCIES_LIST.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                            </select>
                            <div className="w-full h-full rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden hover:border-white/30 transition-colors pointer-events-none">
                                <img src={`https://flagsapi.com/${fromInfo?.countryCode}/shiny/64.png`} alt={fromCurrency} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Swap Divider */}
                <div className="relative h-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full border-t border-dashed border-white/10"></div>
                    </div>
                    <button onClick={handleSwap} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-700 hover:bg-primary rounded-full flex items-center justify-center border-4 border-slate-800 transition-all shadow-lg z-10 group">
                        <ArrowsRightLeftIcon className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>

                {/* TO Input */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Buying</p>
                        <p className="text-3xl font-bold text-green-400 font-mono">
                            {convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-lg font-bold text-white">{toCurrency}</p>
                            <p className="text-xs text-slate-500">{toInfo?.name}</p>
                        </div>
                        <div className="relative w-12 h-12">
                            <select 
                                value={toCurrency} 
                                onChange={(e) => setToCurrency(e.target.value)} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            >
                                {CURRENCIES_LIST.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                            </select>
                            <div className="w-full h-full rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden hover:border-white/30 transition-colors pointer-events-none">
                                <img src={`https://flagsapi.com/${toInfo?.countryCode}/shiny/64.png`} alt={toCurrency} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 mb-1">Indicative Rate</p>
                    <p className="text-sm font-bold text-white font-mono">
                        1 {fromCurrency} = <span className="text-primary">{exchangeRate.toFixed(5)}</span> {toCurrency}
                    </p>
                </div>
                <div className="w-24">
                    <Sparkline color="#10b981" />
                </div>
            </div>
            
            <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <SpinnerIcon className="w-4 h-4 text-primary" />
                <span>Execute Exchange</span>
            </button>
        </div>
    </div>
  );
};
