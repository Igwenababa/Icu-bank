import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon, ShieldCheckIcon, LockClosedIcon, ServerIcon, GlobeAltIcon, XIcon, getServiceIcon } from './Icons';

interface LinkServiceModalProps {
    serviceName: string;
    onClose: () => void;
    onLink: (serviceName: string, identifier: string) => void;
}

type Step = 'consent' | 'connecting' | 'success';

const connectionLogs = [
    "Initializing secure handshake...",
    "Verifying SSL/TLS certificates...",
    "Requesting authorization token...",
    "Validating merchant credentials...",
    "Establishing encrypted tunnel...",
    "Syncing historical transaction data...",
    "Finalizing connection..."
];

export const LinkServiceModal: React.FC<LinkServiceModalProps> = ({ serviceName, onClose, onLink }) => {
    const [step, setStep] = useState<Step>('consent');
    const [identifier, setIdentifier] = useState('');
    const [logIndex, setLogIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    
    const ServiceIcon = getServiceIcon(serviceName);
    const identifierType = serviceName === 'CashApp' ? '$Cashtag' : serviceName === 'Zelle' ? 'Email or Phone' : 'Email Address';

    // Connection Simulation Effect
    useEffect(() => {
        if (step === 'connecting') {
            const totalDuration = 3000;
            const intervalTime = totalDuration / connectionLogs.length;

            const logInterval = setInterval(() => {
                setLogIndex(prev => {
                    if (prev < connectionLogs.length - 1) return prev + 1;
                    return prev;
                });
            }, intervalTime);

            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, totalDuration / 50);

            const completionTimer = setTimeout(() => {
                setStep('success');
                clearInterval(logInterval);
                clearInterval(progressInterval);
            }, totalDuration + 500);

            return () => {
                clearInterval(logInterval);
                clearInterval(progressInterval);
                clearTimeout(completionTimer);
            };
        }
    }, [step]);

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return;
        setStep('connecting');
    };

    const handleFinish = () => {
        onLink(serviceName, identifier);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col animate-fade-in-up">
                
                {/* Header */}
                <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <LockClosedIcon className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-mono text-green-400 uppercase">Secure Connection</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg z-10 relative">
                                {ServiceIcon && <ServiceIcon className="w-12 h-12" />}
                            </div>
                            {step === 'connecting' && (
                                <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl animate-pulse"></div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-4">
                            {step === 'consent' ? `Connect ${serviceName}` : step === 'connecting' ? 'Authenticating...' : 'Connected'}
                        </h2>
                    </div>

                    {step === 'consent' && (
                        <form onSubmit={handleConnect} className="space-y-6">
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 space-y-3">
                                <h4 className="text-sm font-semibold text-slate-300">Permissions Requested:</h4>
                                <ul className="text-xs text-slate-400 space-y-2">
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-primary"/> View account balance and details</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-primary"/> View transaction history</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-primary"/> Initiate transfers (requires approval)</li>
                                </ul>
                            </div>

                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium text-slate-300 mb-2">{identifierType}</label>
                                <input
                                    type="text"
                                    id="identifier"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder={`Enter your ${serviceName} ID`}
                                    autoFocus
                                    required
                                />
                            </div>

                            <p className="text-[10px] text-slate-500 text-center">
                                By clicking "Agree & Connect", you agree to the iCredit Union® Third-Party Access Policy and {serviceName}'s Terms of Service.
                            </p>

                            <div className="flex gap-3">
                                <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 text-white bg-primary hover:bg-primary-600 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all">Agree & Connect</button>
                            </div>
                        </form>
                    )}

                    {step === 'connecting' && (
                        <div className="space-y-6">
                            {/* Visual Connection Graph */}
                            <div className="flex justify-between items-center px-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                                        <ServerIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1">iCredit</span>
                                </div>
                                <div className="flex-1 h-px bg-slate-700 mx-2 relative">
                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#0052FF] animate-ping-slow" style={{ left: `${progress}%` }}></div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                        {ServiceIcon && <ServiceIcon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1">{serviceName}</span>
                                </div>
                            </div>

                            {/* Terminal Logs */}
                            <div className="bg-black/50 rounded-lg p-4 font-mono text-xs space-y-1 h-24 overflow-hidden border border-white/5">
                                {connectionLogs.slice(0, logIndex + 1).map((log, i) => (
                                    <div key={i} className="text-green-400/80 flex gap-2">
                                        <span className="text-slate-600">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                        {log}
                                    </div>
                                ))}
                                <div className="animate-pulse text-primary">_</div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-6 animate-fade-in-up">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 ring-1 ring-green-500/50">
                                <CheckCircleIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-slate-300">Your <strong className="text-white">{serviceName}</strong> account has been successfully linked.</p>
                                <p className="text-sm text-slate-500 mt-2">You can now initiate transfers directly from your dashboard.</p>
                            </div>
                            <button onClick={handleFinish} className="w-full py-3 text-white bg-green-600 hover:bg-green-500 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all">
                                Complete Setup
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes ping-slow {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    75%, 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                }
                .animate-ping-slow {
                    animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
};