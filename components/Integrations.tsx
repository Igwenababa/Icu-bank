import React, { useState } from 'react';
import { PayPalIcon, CashAppIcon, ZelleIcon, WesternUnionIcon, MoneyGramIcon, CheckCircleIcon, OnfidoIcon, TwilioIcon, SendGridIcon, PlusIcon, ArrowRightIcon, ShieldCheckIcon, GlobeAltIcon, ChartBarIcon, CogIcon } from './Icons.tsx';
import { LinkServiceModal } from './LinkServiceModal.tsx';

interface IntegrationsProps {
    linkedServices: Record<string, string>;
    onLinkService: (serviceName: string, identifier: string) => void;
}

const ServiceCard: React.FC<{ 
    name: string; 
    icon: React.ComponentType<{ className?: string }>; 
    description: string; 
    isLinked: boolean; 
    identifier?: string; 
    onLink: () => void 
}> = ({ name, icon: Icon, description, isLinked, identifier, onLink }) => (
    <div className={`group relative overflow-hidden p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 flex flex-col h-full ${isLinked ? 'bg-slate-800/60 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(0,82,255,0.15)]'}`}>
        
        {/* Active Pulse for Linked */}
        {isLinked && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Active</span>
            </div>
        )}

        <div className="flex items-start justify-between mb-6">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${isLinked ? 'bg-white' : 'bg-white/90'}`}>
                <Icon className="w-8 h-8" />
            </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">{name}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">{description}</p>

        <div className="mt-auto pt-4 border-t border-white/5">
            {isLinked ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center text-xs text-green-400 font-medium bg-green-500/10 px-3 py-2 rounded-lg">
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        <span className="truncate">Linked: {identifier}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 text-right">Last synced: Just now</p>
                </div>
            ) : (
                <button
                    onClick={onLink}
                    className="w-full py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-primary hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                    <span>Connect</span>
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            )}
        </div>
    </div>
);

const PartnerCard: React.FC<{
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    website: string;
    category: string;
}> = ({ name, icon: Icon, description, website, category }) => (
    <a href={website} target="_blank" rel="noopener noreferrer" className="block group relative p-5 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 hover:border-white/10 transition-all duration-300">
        <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-slate-900 border border-white/5 text-slate-400 group-hover:text-white transition-colors">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-200 group-hover:text-white">{name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{category}</span>
                </div>
                <p className="text-xs text-slate-500 group-hover:text-slate-400 leading-relaxed">{description}</p>
            </div>
            <ArrowRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
    </a>
);

export const Integrations: React.FC<IntegrationsProps> = ({ linkedServices, onLinkService }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    const handleLinkClick = (serviceName: string) => {
        setSelectedService(serviceName);
        setModalOpen(true);
    };

    const handleLink = (serviceName: string, identifier: string) => {
        onLinkService(serviceName, identifier);
        setModalOpen(false);
    };

    const paymentServices = [
        { name: 'PayPal', icon: PayPalIcon, description: 'Global secure payments and transfers.' },
        { name: 'CashApp', icon: CashAppIcon, description: 'Instant P2P payments and crypto.' },
        { name: 'Zelle', icon: ZelleIcon, description: 'Fast, free US bank-to-bank transfers.' },
        { name: 'Western Union', icon: WesternUnionIcon, description: 'International cash pickup and wiring.' },
        { name: 'MoneyGram', icon: MoneyGramIcon, description: 'Reliable cross-border remittance.' },
    ];

    // Adding mock business integrations for a "complete" feel
    const businessServices = [
        { name: 'QuickBooks', icon: ChartBarIcon, description: 'Sync transactions for automated accounting.' }, // Placeholder icon
        { name: 'Stripe', icon: CogIcon, description: 'Accept payments directly to your account.' }, // Placeholder icon
    ];

    return (
        <>
            {modalOpen && (
                <LinkServiceModal
                    serviceName={selectedService}
                    onClose={() => setModalOpen(false)}
                    onLink={handleLink}
                />
            )}
            
            <div className="relative min-h-screen text-white">
                {/* Immersive Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] mask-image-gradient"></div>
                </div>

                <div className="relative z-10 space-y-12 pb-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
                                    <GlobeAltIcon className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-white">Integration Hub</h2>
                            </div>
                            <p className="text-slate-400 max-w-2xl">
                                Connect your financial ecosystem. Securely link external payment gateways, accounting software, and verification services to streamline your operations.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-white/10 backdrop-blur-sm">
                            <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-medium text-slate-300">Bank-Grade Encryption Protocols Active</span>
                        </div>
                    </div>

                    {/* Payment Gateways Grid */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            Payment Gateways
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paymentServices.map(service => (
                                <ServiceCard 
                                    key={service.name}
                                    {...service}
                                    isLinked={linkedServices.hasOwnProperty(service.name)}
                                    identifier={linkedServices[service.name]}
                                    onLink={() => handleLinkClick(service.name)}
                                />
                            ))}
                            
                            {/* Add New Placeholder */}
                            <button className="group relative p-6 rounded-2xl border border-dashed border-slate-700 bg-slate-800/20 hover:bg-slate-800/40 transition-all duration-300 flex flex-col items-center justify-center text-center h-full min-h-[240px]">
                                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <PlusIcon className="w-6 h-6 text-slate-400" />
                                </div>
                                <h4 className="font-bold text-slate-300">Add Custom API</h4>
                                <p className="text-xs text-slate-500 mt-2 px-4">Connect custom endpoints or specialized regional gateways.</p>
                            </button>
                        </div>
                    </div>

                    {/* Platform Infrastructure Partners */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                Platform Infrastructure
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <PartnerCard 
                                    name="Onfido" 
                                    icon={OnfidoIcon} 
                                    category="Security"
                                    description="Real-time identity verification and AML compliance engine." 
                                    website="https://onfido.com" 
                                />
                                <PartnerCard 
                                    name="Twilio" 
                                    icon={TwilioIcon} 
                                    category="Communication"
                                    description="Secure 2FA delivery and transactional SMS notifications." 
                                    website="https://twilio.com" 
                                />
                                <PartnerCard 
                                    name="SendGrid" 
                                    icon={SendGridIcon} 
                                    category="Communication"
                                    description="Enterprise-grade email delivery infrastructure." 
                                    website="https://sendgrid.com" 
                                />
                                <PartnerCard 
                                    name="Plaid (Coming Soon)" 
                                    icon={GlobeAltIcon} 
                                    category="Banking"
                                    description="Seamless bank account linking and balance verification." 
                                    website="https://plaid.com" 
                                />
                            </div>
                        </div>

                        {/* API Status Widget */}
                        <div className="lg:col-span-1">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                API Status
                            </h3>
                            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Payment API</span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> 99.99% Uptime
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-full shadow-[0_0_10px_#22c55e]"></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm text-slate-400">Identity API</span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Operational
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-full shadow-[0_0_10px_#22c55e]"></div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm text-slate-400">Messaging Gateway</span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Operational
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-full shadow-[0_0_10px_#22c55e]"></div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                                    <a href="#" className="text-xs text-primary hover:text-primary-300 transition-colors">View Full System Status &rarr;</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};