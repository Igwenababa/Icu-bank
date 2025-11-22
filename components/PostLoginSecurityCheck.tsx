
import React, { useState, useEffect, useRef } from 'react';
import { 
    ShieldCheckIcon, 
    LockClosedIcon, 
    GlobeAmericasIcon, 
    DevicePhoneMobileIcon, 
    CheckCircleIcon, 
    SpinnerIcon,
    ServerIcon,
    WifiIcon
} from './Icons';

interface PostLoginSecurityCheckProps {
    onComplete: () => void;
}

// Realistic technical logs
const SYSTEM_LOGS = [
    "[INIT] Secure Session Handshake started...",
    "[NET] Verifying TLS 1.3 encryption (AES-256-GCM)...",
    "[AUTH] Token exchange successful. Session ID: 8f92-11b...",
    "[GEO] IP Analysis: Low Risk. Location consistent.",
    "[DEV] Device Fingerprint: SHA-256 Match.",
    "[RISK] Behavioral Analysis Score: 99/100.",
    "[DB] Syncing user profile preferences...",
    "[API] Establishing WebSocket connection to wss://api.icredit...",
    "[SEC] 2FA Verification: Bylaw satisfied.",
    "[FIN] Decrypting financial ledger cache...",
    "[SUCCESS] Secure Environment Initialized."
];

const SecurityModule: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    status: 'pending' | 'scanning' | 'verified'; 
    delay: number 
}> = ({ icon, label, status, delay }) => {
    const [internalStatus, setInternalStatus] = useState<'pending' | 'scanning' | 'verified'>('pending');

    useEffect(() => {
        let scanTimer: number;
        let verifyTimer: number;

        const startTimer = setTimeout(() => {
            setInternalStatus('scanning');
            // Scan duration reduced for speed
            scanTimer = setTimeout(() => {
                setInternalStatus('verified');
            }, 300 + Math.random() * 200); 
        }, delay);

        return () => {
            clearTimeout(startTimer);
            clearTimeout(scanTimer);
            clearTimeout(verifyTimer);
        };
    }, [delay]);

    const isActive = internalStatus === 'scanning';
    const isDone = internalStatus === 'verified';

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${isActive ? 'bg-primary/10 border-primary/30' : isDone ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/50 border-white/5'}`}>
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isActive ? 'text-primary animate-pulse' : isDone ? 'text-green-400' : 'text-slate-500'}`}>
                    {icon}
                </div>
                <div>
                    <p className={`text-sm font-semibold ${isDone ? 'text-slate-200' : 'text-slate-400'}`}>{label}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                        {isActive ? 'ANALYZING...' : isDone ? 'VERIFIED' : 'PENDING'}
                    </p>
                </div>
            </div>
            <div className="w-5">
                {isActive && <SpinnerIcon className="w-4 h-4 text-primary" />}
                {isDone && <CheckCircleIcon className="w-5 h-5 text-green-400 animate-pop-in" />}
            </div>
        </div>
    );
};

export const PostLoginSecurityCheck: React.FC<PostLoginSecurityCheckProps> = ({ onComplete }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const logsEndRef = useRef<HTMLDivElement>(null);
    
    // Initial setup
    useEffect(() => {
        const totalDuration = 1200; // Significantly reduced from 2600ms for snappier feel
        const logIntervalTime = totalDuration / SYSTEM_LOGS.length;

        // Progress Bar Animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2; // Faster increment
            });
        }, totalDuration / 50);

        // Log Stream Animation
        let currentLogIndex = 0;
        const logInterval = setInterval(() => {
            if (currentLogIndex < SYSTEM_LOGS.length) {
                setLogs(prev => [...prev, SYSTEM_LOGS[currentLogIndex]]);
                currentLogIndex++;
            } else {
                clearInterval(logInterval);
            }
        }, logIntervalTime);

        // Final Completion Trigger
        const completionTimer = setTimeout(() => {
            onComplete();
        }, totalDuration + 100); // Minimized buffer

        return () => {
            clearInterval(progressInterval);
            clearInterval(logInterval);
            clearTimeout(completionTimer);
        };
    }, [onComplete]);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[100] font-sans overflow-hidden">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,82,255,0.05),transparent_70%)]"></div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 p-6 relative z-10">
                
                {/* Left Panel: Status Modules */}
                <div className="space-y-4">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <ShieldCheckIcon className="w-8 h-8 text-primary" />
                            <span>System Integrity Check</span>
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Establishing secure banking environment...</p>
                    </div>

                    <div className="space-y-3">
                        <SecurityModule 
                            icon={<LockClosedIcon className="w-5 h-5" />} 
                            label="Encryption & Protocols" 
                            status="pending" 
                            delay={50} 
                        />
                        <SecurityModule 
                            icon={<GlobeAmericasIcon className="w-5 h-5" />} 
                            label="Network & Geofencing" 
                            status="pending" 
                            delay={300} 
                        />
                        <SecurityModule 
                            icon={<DevicePhoneMobileIcon className="w-5 h-5" />} 
                            label="Device Fingerprinting" 
                            status="pending" 
                            delay={600} 
                        />
                        <SecurityModule 
                            icon={<ServerIcon className="w-5 h-5" />} 
                            label="Account Synchronization" 
                            status="pending" 
                            delay={900} 
                        />
                    </div>
                </div>

                {/* Right Panel: Visualizations & Logs */}
                <div className="flex flex-col gap-4">
                    {/* Radar/Map Simulation */}
                    <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden shadow-inner min-h-[200px] flex items-center justify-center">
                        {/* Radar Rings */}
                        <div className="absolute w-64 h-64 border border-primary/20 rounded-full animate-ping [animation-duration:3s]"></div>
                        <div className="absolute w-48 h-48 border border-primary/30 rounded-full animate-pulse"></div>
                        <div className="absolute w-32 h-32 border border-primary/40 rounded-full"></div>
                        
                        {/* Scanning Line */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[20%] w-full animate-scan-vertical"></div>
                        
                        {/* Map Points */}
                        <div className="relative z-10 flex flex-col items-center">
                            <GlobeAmericasIcon className="w-16 h-16 text-slate-700" />
                            <div className="mt-2 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded text-xs text-green-400 font-mono flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                SECURE CONNECTION ESTABLISHED
                            </div>
                        </div>
                    </div>

                    {/* System Terminal */}
                    <div className="h-48 bg-black/90 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 bg-slate-800/50 px-3 py-1 text-[10px] text-slate-400 border-b border-slate-700 flex justify-between">
                            <span>TERMINAL: SYS_AUTH_DMN</span>
                            <span>PID: 4492</span>
                        </div>
                        <div className="mt-6 h-full overflow-y-auto space-y-1 pb-4 scrollbar-hide">
                            {logs.map((log, i) => (
                                <div key={i} className="text-green-500/80 animate-fade-in-up">
                                    <span className="text-slate-500 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                                    {log}
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Progress */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                <div 
                    className="h-full bg-gradient-to-r from-primary-600 to-cyan-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            <style>{`
                @keyframes scan-vertical {
                    0% { transform: translateY(-150%); }
                    100% { transform: translateY(450%); }
                }
                .animate-scan-vertical {
                    animation: scan-vertical 2s linear infinite;
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    );
};
