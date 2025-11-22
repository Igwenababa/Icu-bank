
import React, { useState, useEffect, useRef } from 'react';
import {
    UserCircleIcon,
    HomeIcon,
    IdentificationIcon,
    LockClosedIcon,
    CheckCircleIcon,
    ICreditUnionLogo,
    DevicePhoneMobileIcon,
    ArrowRightIcon,
    CameraIcon,
    DocIcon,
    ShieldCheckIcon,
    InfoIcon,
    ArrowLeftIcon,
    SpinnerIcon
} from './Icons.tsx';
import { ALL_COUNTRIES } from '../constants.ts';
import { Country } from '../types.ts';
import { AccountProvisioningAnimation } from './AccountProvisioningAnimation.tsx';
import { validatePassword, validatePhoneNumber } from '../utils/validation.ts';
import { sendTransactionalEmail, sendSmsNotification, generateNewAccountOtpEmail, generateNewAccountOtpSms } from '../services/notificationService.ts';
import { CountrySelector } from './CountrySelector.tsx';
import { PasswordGenerator } from './PasswordGenerator.tsx';

interface AccountCreationFlowProps {
    onBackToLogin: () => void;
    onCreateAccountSuccess: (formData: any) => void;
}

const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940&auto=format&fit=crop", // Corporate
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop", // Lifestyle
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2940&auto=format&fit=crop", // City
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"  // Tech
];

const FloatingInput = ({ label, error, ...props }: any) => (
    <div className="relative group mb-1">
        <input
            {...props}
            className={`block w-full px-4 pt-5 pb-2 bg-slate-950/50 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-primary focus:ring-primary'} rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-1 transition-all peer`}
            placeholder={label}
        />
        <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-primary-400 pointer-events-none">
            {label}
        </label>
        {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
    </div>
);

const StepIndicator: React.FC<{ steps: { label: string }[]; currentStep: number }> = ({ steps, currentStep }) => (
    <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
                <div key={index} className="flex flex-col items-center relative z-10">
                    <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2 
                        ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(0,82,255,0.5)]' : 'bg-slate-800 border-slate-600 text-slate-500'}`}
                    >
                        {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : index + 1}
                    </div>
                    <span className={`text-[10px] mt-2 uppercase tracking-wider font-semibold transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        {s.label}
                    </span>
                </div>
            );
        })}
        {/* Connecting Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-700 -z-0 mx-6">
            <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500" 
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
        </div>
    </div>
);

export const AccountCreationFlow: React.FC<AccountCreationFlowProps> = ({ onBackToLogin, onCreateAccountSuccess }) => {
    const [bgIndex, setBgIndex] = useState(0);
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: ALL_COUNTRIES.find(c => c.code === 'US')!,
        password: '',
        confirmPassword: '',
        pin: '',
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [idFrontCaptured, setIdFrontCaptured] = useState(false);
    const [idBackCaptured, setIdBackCaptured] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });
    const [otp, setOtp] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Background Rotator
    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setPasswordCriteria(validatePassword(formData.password));
    }, [formData.password]);
    
    useEffect(() => {
        if (step === 5) { 
            const { subject, body } = generateNewAccountOtpEmail(formData.fullName);
            sendTransactionalEmail(formData.email, subject, body);
            sendSmsNotification(formData.phone, generateNewAccountOtpSms());
            
            const timer = setTimeout(() => {
                setStep(6);
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [step, formData.fullName, formData.email, formData.phone]);

    const steps = [
        { label: 'Profile' },
        { label: 'Residency' },
        { label: 'Identity' },
        { label: 'Security' },
        { label: 'Review' },
    ];
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    
    const handleCountryChange = (country: Country) => {
        setFormData(prev => ({ ...prev, country }));
    };

    const handleGeneratedPassword = (password: string) => {
        setFormData(prev => ({
            ...prev,
            password: password,
            confirmPassword: password,
        }));
    };

    const validateStep = () => {
        const newErrors: Record<string, string | null> = {};
        switch (step) {
            case 0: // Personal
                if (formData.fullName.trim().split(' ').length < 2) newErrors.fullName = 'Please enter your full legal name.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format.';
                const phoneError = validatePhoneNumber(formData.phone, formData.country.code);
                if (phoneError) newErrors.phone = phoneError;
                break;
            case 1: // Address
                if (formData.address.trim().length < 5) newErrors.address = 'Street address is required.';
                if (formData.city.trim().length < 2) newErrors.city = 'City is required.';
                if (formData.state.trim().length < 2) newErrors.state = 'State/Province is required.';
                if (formData.postalCode.trim().length < 3) newErrors.postalCode = 'Valid postal code required.';
                break;
            case 2: // Identity
                if (!idFrontCaptured || !idBackCaptured) newErrors.idFile = 'Regulatory Requirement: Both sides of ID must be captured.';
                break;
            case 3: // Security
                const criteriaMet = Object.values(passwordCriteria).every(Boolean);
                if (!criteriaMet) newErrors.password = 'Password does not meet complexity requirements.';
                if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
                if (!/^\d{4}$/.test(formData.pin)) newErrors.pin = 'PIN must be exactly 4 digits.';
                break;
            case 4: // Review
                if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the Terms of Service to proceed.';
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep()) {
            setStep(5); // Start provisioning
        }
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp === '123456') {
            setErrors({});
            setStep(7); 
            setTimeout(() => {
                onCreateAccountSuccess(formData);
            }, 2000); 
        } else {
            setErrors({ otp: 'Invalid verification code.' });
        }
    };

    if (step === 5) {
        return (
            <div className="relative min-h-screen w-full overflow-hidden">
                 {/* Background */}
                {BACKGROUND_IMAGES.map((img, index) => (
                    <div key={index} className={`absolute inset-0 transition-opacity duration-[2000ms] ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}>
                        <img src={img} alt="bg" className="w-full h-full object-cover" />
                    </div>
                ))}
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"></div>
                <AccountProvisioningAnimation onComplete={() => {}} />
            </div>
        );
    }

    // Helper Components for Steps
    const PasswordStrengthMeter: React.FC<{ criteria: { [key: string]: boolean } }> = ({ criteria }) => {
        const score = Object.values(criteria).filter(Boolean).length;
        const getStrength = () => {
            if (formData.password.length === 0) return { width: '0%', color: 'bg-slate-600', label: '' };
            if (score <= 2) return { width: '20%', color: 'bg-red-500', label: 'Weak' };
            if (score <= 3) return { width: '50%', color: 'bg-yellow-500', label: 'Fair' };
            if (score === 4) return { width: '75%', color: 'bg-blue-500', label: 'Good' };
            if (score === 5) return { width: '100%', color: 'bg-green-500', label: 'Strong' };
            return { width: '0%', color: 'bg-slate-600', label: '' };
        };
        const { width, color, label } = getStrength();
        return (
            <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Password Strength</span>
                    <span className={color.replace('bg-', 'text-')}>{label}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${color}`} style={{ width }} />
                </div>
            </div>
        );
    };

    const IDCapture: React.FC<{ title: string, captured: boolean, onCapture: () => void }> = ({ title, captured, onCapture }) => {
        const [isScanning, setIsScanning] = useState(false);
        
        const handleScan = () => {
            setIsScanning(true);
            setTimeout(() => {
                setIsScanning(false);
                onCapture();
            }, 2000);
        };

        return (
            <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${captured ? 'border-green-500/50 bg-green-500/10' : 'border-slate-700 bg-slate-900/50'}`}>
                <div className="p-4 text-center">
                    <h4 className="font-bold text-slate-200 text-sm mb-3">{title}</h4>
                    
                    <div className="relative w-full aspect-[1.6] bg-black/40 rounded-lg flex items-center justify-center overflow-hidden group cursor-pointer" onClick={!captured ? handleScan : undefined}>
                        {isScanning ? (
                            <>
                                <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_#4ade80] animate-scan-vertical"></div>
                                <div className="font-mono text-xs text-green-400">ANALYZING...</div>
                            </>
                        ) : captured ? (
                            <div className="flex flex-col items-center text-green-500 animate-pop-in">
                                <CheckCircleIcon className="w-10 h-10 mb-2" />
                                <span className="text-xs font-bold tracking-wider">VERIFIED</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-500 group-hover:text-white transition-colors">
                                <CameraIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs">Tap to Capture</span>
                            </div>
                        )}
                        
                        {/* Corner Guides */}
                        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/30"></div>
                        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/30"></div>
                        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/30"></div>
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/30"></div>
                    </div>
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (step) {
            case 0: // Personal
                return (
                    <div className="space-y-5 animate-fade-in-up">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white font-serif">Personal Profile</h2>
                            <p className="text-sm text-slate-400">Legal information for KYC compliance.</p>
                        </div>
                        <FloatingInput label="Full Legal Name" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} autoFocus />
                        <FloatingInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                        <FloatingInput label="Mobile Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} />
                        <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <InfoIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-300">We collect this information to comply with federal banking regulations and to secure your account identity.</p>
                        </div>
                    </div>
                );
            case 1: // Address
                return (
                    <div className="space-y-5 animate-fade-in-up">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white font-serif">Primary Residence</h2>
                            <p className="text-sm text-slate-400">Where should we send your physical card?</p>
                        </div>
                        <FloatingInput label="Street Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput label="City" name="city" value={formData.city} onChange={handleChange} error={errors.city} />
                            <FloatingInput label="State / Province" name="state" value={formData.state} onChange={handleChange} error={errors.state} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} error={errors.postalCode} />
                            <div>
                                <CountrySelector 
                                    selectedCountry={formData.country}
                                    onSelect={handleCountryChange}
                                    className="w-full flex items-center justify-between bg-slate-950/50 border border-slate-600 text-white p-4 rounded-xl h-[58px]"
                                />
                            </div>
                        </div>
                    </div>
                );
             case 2: // Identity
                return (
                     <div className="space-y-6 animate-fade-in-up">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-white font-serif">Identity Verification</h2>
                            <p className="text-sm text-slate-400">Government-issued ID required.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <IDCapture title="Front of ID" captured={idFrontCaptured} onCapture={() => setIdFrontCaptured(true)} />
                            <IDCapture title="Back of ID" captured={idBackCaptured} onCapture={() => setIdBackCaptured(true)} />
                        </div>
                        {errors.idFile && <p className="text-red-400 text-center text-sm bg-red-500/10 py-2 rounded border border-red-500/20">{errors.idFile}</p>}
                    </div>
                );
            case 3: // Security
                return (
                    <div className="space-y-5 animate-fade-in-up">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white font-serif">Secure Access</h2>
                            <p className="text-sm text-slate-400">Set up your credentials.</p>
                        </div>
                        
                        <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-slate-300">Password</label>
                                <button type="button" onClick={() => setShowGenerator(prev => !prev)} className="text-xs font-semibold text-primary-400 hover:text-white transition-colors">
                                  {showGenerator ? 'Hide Generator' : 'Generate Strong Password'}
                                </button>
                            </div>
                            {showGenerator && <div className="mb-4"><PasswordGenerator onPasswordGenerated={handleGeneratedPassword} /></div>}
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                className={`w-full bg-slate-950/50 border border-slate-600 p-3 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="••••••••"
                            />
                            <PasswordStrengthMeter criteria={passwordCriteria} />
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <FloatingInput label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                        
                        <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5 flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-300">4-Digit PIN</label>
                            <input 
                                type="password" 
                                name="pin" 
                                value={formData.pin} 
                                onChange={e => setFormData(prev => ({...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4)}))} 
                                maxLength={4} 
                                className="w-24 bg-slate-950 border border-slate-600 p-2 rounded-lg text-center tracking-[0.5em] text-white focus:border-primary outline-none" 
                                placeholder="••••"
                            />
                        </div>
                        {errors.pin && <p className="text-red-400 text-xs text-right">{errors.pin}</p>}
                    </div>
                );
            case 4: // Review
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-white font-serif">Review Application</h2>
                            <p className="text-sm text-slate-400">Please confirm your details are correct.</p>
                        </div>
                        
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4 text-sm relative overflow-hidden">
                            {/* Receipt Texture */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            
                            <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                <span className="text-slate-400">Name</span>
                                <span className="col-span-2 text-white font-medium text-right">{formData.fullName}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                <span className="text-slate-400">Email</span>
                                <span className="col-span-2 text-white font-medium text-right truncate">{formData.email}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                <span className="text-slate-400">Phone</span>
                                <span className="col-span-2 text-white font-medium text-right">{formData.phone}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pb-1">
                                <span className="text-slate-400">Address</span>
                                <span className="col-span-2 text-white font-medium text-right">
                                    {formData.address}<br/>
                                    {formData.city}, {formData.state} {formData.postalCode}<br/>
                                    {formData.country.name}
                                </span>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                            <input type="checkbox" id="terms" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="mt-1 w-5 h-5 rounded border-slate-500 text-primary focus:ring-primary bg-transparent" />
                            <span className="text-sm text-slate-300">I confirm I have read and agree to the <a href="#" className="text-primary-400 hover:underline">Global Service Agreement</a>, <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>, and <a href="#" className="text-primary-400 hover:underline">E-Sign Consent</a>.</span>
                        </label>
                         {errors.agreedToTerms && <p className="text-red-400 text-center text-xs font-bold">{errors.agreedToTerms}</p>}
                    </div>
                );
            case 6: // OTP
                return (
                    <div className="text-center animate-fade-in-up py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 ring-1 ring-primary/30 shadow-[0_0_30px_rgba(0,82,255,0.2)]">
                            <DevicePhoneMobileIcon className="w-10 h-10 text-primary"/>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Verify It's You</h3>
                        <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">Enter the 6-digit code sent to your device to activate your account.</p>
                        
                        <form onSubmit={handleOtpSubmit}>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                className={`w-64 mx-auto bg-slate-950 border border-slate-700 p-4 text-center text-3xl tracking-[0.5em] rounded-xl transition-all focus:border-primary focus:shadow-[0_0_20px_rgba(0,82,255,0.3)] outline-none text-white font-mono`}
                                maxLength={6}
                                placeholder="------"
                                autoFocus
                            />
                            {errors.otp && <p className="text-red-400 text-sm mt-4">{errors.otp}</p>}
                            <button type="submit" className="w-full mt-8 py-4 text-white bg-primary hover:bg-primary-600 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                Activate Account
                            </button>
                        </form>
                        <p className="text-xs text-slate-500 mt-6">Did not receive code? <button className="text-primary-400 hover:text-white">Resend</button></p>
                    </div>
                );
            case 7: // Success
                return (
                    <div className="text-center animate-fade-in-up py-12">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                            <CheckCircleIcon className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white tracking-tight">Welcome Aboard</h3>
                        <p className="text-slate-300 mt-2 text-lg">Your iCredit Union account is active.</p>
                        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-white/10 max-w-sm mx-auto">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Next Step</p>
                            <p className="text-sm font-semibold text-white">Redirecting to your personal dashboard...</p>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden text-slate-200">
            {/* Rotating Background */}
            {BACKGROUND_IMAGES.map((img, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-[2000ms] ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={img} alt="bg" className="w-full h-full object-cover" />
                </div>
            ))}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.8)_100%)]"></div>

            <div className="relative z-10 w-full max-w-xl p-4">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in-down">
                    <div className="inline-flex items-center gap-2 p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl mb-4">
                        <ICreditUnionLogo />
                        <span className="font-serif font-bold text-white tracking-wider">iCredit Union</span>
                    </div>
                </div>
                
                <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                    {step < 6 && <div className="pt-8 pb-4 bg-gradient-to-b from-white/5 to-transparent"><StepIndicator steps={steps} currentStep={step} /></div>}
                    
                    <div className="p-8 min-h-[420px] flex flex-col justify-center relative">
                        {renderStepContent()}
                    </div>

                    {step < 5 && (
                        <div className="p-6 bg-slate-950/50 border-t border-white/5 flex justify-between items-center">
                            <button 
                                onClick={step === 0 ? onBackToLogin : handleBack} 
                                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                                {step === 0 ? 'Cancel' : 'Back'}
                            </button>
                            <button 
                                onClick={step === steps.length - 1 ? handleSubmit : handleNext} 
                                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>{step === steps.length - 1 ? 'Submit Application' : 'Continue'}</span>
                                {step !== steps.length - 1 && <ArrowRightIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>
                
                <p className="text-center text-[10px] text-slate-500 mt-6">
                    Your data is encrypted with AES-256 protocols and transmitted securely.
                    <br/>© {new Date().getFullYear()} iCredit Union. NMLS #999999.
                </p>
            </div>
            
            <style>{`
                @keyframes scan-vertical {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan-vertical {
                    animation: scan-vertical 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
