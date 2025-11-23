
import React, { useState, useEffect } from 'react';
import { View } from '../types.ts';
import {
    ICreditUnionLogo,
    XSocialIcon,
    LinkedInIcon,
    InstagramIcon,
    AppleIcon,
    GooglePlayIcon,
    FdicIcon,
    EqualHousingLenderIcon,
    GlobeAmericasIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    MapPinIcon,
    PhoneIcon,
    ChevronDownIcon,
    ServerIcon
} from './Icons.tsx';
import { LEGAL_CONTENT } from '../constants.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface FooterProps {
    setActiveView: (view: View) => void;
    onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
    openLegalModal: (title: string, content: string) => void;
}

const FooterLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <li className="group">
        <button 
            onClick={onClick} 
            className="text-sm text-slate-400 hover:text-white transition-all duration-300 group-hover:translate-x-1 flex items-center relative"
        >
            <span className="absolute -left-3 opacity-0 group-hover:opacity-100 group-hover:-left-2 transition-all duration-300 text-primary-400">›</span>
            {children}
        </button>
    </li>
);

const DownloadButton: React.FC<{ icon: React.ReactNode; store: string; title: string; href: string }> = ({ icon, store, title, href }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 w-48 group backdrop-blur-md"
    >
        <div className="opacity-70 group-hover:opacity-100 transition-opacity">
            {icon}
        </div>
        <div className="text-left">
            <p className="text-[10px] leading-none opacity-60 uppercase tracking-wider">{store}</p>
            <p className="text-sm leading-tight font-bold">{title}</p>
        </div>
    </a>
);

const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <span className="font-mono text-xs text-slate-500">
            {time.toUTCString().replace('GMT', 'UTC')}
        </span>
    );
};

const SystemStatus = () => (
    <div className="flex items-center space-x-2 bg-green-900/20 border border-green-500/20 rounded-full px-3 py-1">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Systems Operational</span>
    </div>
);

export const Footer: React.FC<FooterProps> = ({ setActiveView, onOpenSendMoneyFlow, openLegalModal }) => {
    const [region, setRegion] = useState('Global (English)');
    const { t } = useLanguage();

    return (
        <footer className="relative bg-slate-950 text-slate-300 font-sans overflow-hidden border-t border-white/5">
            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940&auto=format&fit=crop')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-900/90"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,82,255,0.05),transparent_60%)]"></div>
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12">
                
                {/* Top Bar: Global Info */}
                <div className="py-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 text-white">
                            <ICreditUnionLogo />
                            <span className="font-bold text-xl tracking-tight">iCredit Union<sup className="text-xs font-normal text-slate-500 ml-0.5">®</sup></span>
                        </div>
                        <div className="hidden md:block h-6 w-px bg-white/10"></div>
                        <div className="hidden md:block">
                            <SystemStatus />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <LockClosedIcon className="w-3 h-3" />
                            <span>Encrypted Connection (TLS 1.3)</span>
                        </div>
                        <div className="hidden md:block h-4 w-px bg-white/10"></div>
                        <LiveClock />
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider hover:text-white transition-colors">
                                <GlobeAmericasIcon className="w-4 h-4" />
                                <span>{region}</span>
                                <ChevronDownIcon className="w-3 h-3" />
                            </button>
                            {/* Mock Region Dropdown */}
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto overflow-hidden">
                                {['Global (English)', 'Americas', 'EMEA', 'Asia Pacific'].map(r => (
                                    <button 
                                        key={r} 
                                        onClick={() => setRegion(r)} 
                                        className="block w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
                    
                    {/* Col 1: About */}
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <h3 className="text-white font-bold text-lg mb-6">Pioneering Global Wealth.</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-8">
                            iCredit Union® combines the heritage of Swiss banking privacy with the speed of modern fintech. We provide a secure, unified platform for your global assets, operating across 190+ countries with real-time settlement.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <DownloadButton icon={<AppleIcon className="w-6 h-6"/>} store="Download on the" title="App Store" href="#" />
                            <DownloadButton icon={<GooglePlayIcon className="w-5 h-5"/>} store="GET IT ON" title="Google Play" href="#" />
                        </div>
                    </div>

                    {/* Col 2: Private Banking */}
                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">{t('footer_private_banking')}</h4>
                        <ul className="space-y-3">
                            <FooterLink onClick={() => setActiveView('accounts')}>{t('header_title_accounts')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('cards')}>{t('header_title_cards')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('invest')}>{t('header_title_invest')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('crypto')}>{t('header_title_crypto')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('loans')}>{t('header_title_loans')}</FooterLink>
                        </ul>
                    </div>

                    {/* Col 3: Services */}
                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">{t('footer_services')}</h4>
                        <ul className="space-y-3">
                            <FooterLink onClick={() => onOpenSendMoneyFlow('send')}>{t('quick_actions_send_money')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('flights')}>{t('header_title_flights')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('insurance')}>{t('header_title_insurance')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('checkin')}>{t('header_title_checkin')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('globalAid')}>{t('header_title_globalAid')}</FooterLink>
                        </ul>
                    </div>

                    {/* Col 4: Support & Corp */}
                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">{t('footer_governance')}</h4>
                        <ul className="space-y-3">
                            <FooterLink onClick={() => setActiveView('about')}>{t('header_title_about')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('support')}>{t('header_title_support')}</FooterLink>
                            <FooterLink onClick={() => setActiveView('security')}>{t('header_title_security')}</FooterLink>
                            <FooterLink onClick={() => openLegalModal('Careers', LEGAL_CONTENT.CAREERS_INFO)}>Careers</FooterLink>
                            <FooterLink onClick={() => setActiveView('contact')}>{t('header_title_contact')}</FooterLink>
                        </ul>
                    </div>

                    {/* Col 5: Contact (Visual) */}
                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">{t('footer_contact')}</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPinIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                <span>123 Finance Street,<br/>World Trade Center,<br/>New York, NY 10007</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <PhoneIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                <span>+1 (800) 555-0199</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <ServerIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                <span>NMLS ID #982929</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Regulatory */}
                <div className="border-t border-white/5 py-12">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" title="Member FDIC">
                                <FdicIcon className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="h-4 w-px bg-white/10"></div>
                            <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" title="Equal Housing Lender">
                                <EqualHousingLenderIcon className="w-6 h-6 opacity-70 hover:opacity-100 transition-opacity" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Equal Housing Lender</span>
                            </div>
                            <div className="h-4 w-px bg-white/10"></div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <ShieldCheckIcon className="w-5 h-5 opacity-70" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">SOC2 Type II Certified</span>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white hover:scale-110 transition-all"><XSocialIcon className="w-5 h-5"/></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white hover:scale-110 transition-all"><LinkedInIcon className="w-5 h-5"/></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white hover:scale-110 transition-all"><InstagramIcon className="w-5 h-5"/></a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 text-[10px] text-slate-500 leading-relaxed space-y-4 text-justify">
                        <p>
                            <strong>Investment Products: Not FDIC Insured • No Bank Guarantee • May Lose Value</strong>
                        </p>
                        <p>
                            iCredit Union® is a registered trademark of International Credit Union Group, N.A. Banking products and services are provided by iCredit Union N.A. Member FDIC. 
                            The "iCredit Union" name, logo, and related trade marks are owned by iCredit Union Group.
                        </p>
                        <p>
                            Digital assets are not legal tender, are not backed by the government, and crypto accounts are not subject to FDIC or SIPC protections. 
                            Cryptocurrency trading involves significant risk and may not be suitable for all investors. 
                            Rates for lending products are subject to change without notice and are based on creditworthiness.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 pt-4 font-semibold uppercase tracking-wider">
                            <button onClick={() => setActiveView('privacy')} className="hover:text-white transition-colors">{t('header_title_privacy')}</button>
                            <button onClick={() => openLegalModal('Terms of Use', LEGAL_CONTENT.TERMS_OF_USE)} className="hover:text-white transition-colors">Terms of Use</button>
                            <button onClick={() => openLegalModal('Cookie Policy', LEGAL_CONTENT.COOKIE_POLICY)} className="hover:text-white transition-colors">Cookies</button>
                            <button onClick={() => openLegalModal('Accessibility', '<p>Accessibility statement...</p>')} className="hover:text-white transition-colors">Accessibility</button>
                            <button onClick={() => openLegalModal('Security', '<p>Security policy...</p>')} className="hover:text-white transition-colors">Security</button>
                        </div>
                        <p className="text-center md:text-left pt-4 opacity-50">
                            © {new Date().getFullYear()} iCredit Union Group, N.A. All rights reserved. 
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
