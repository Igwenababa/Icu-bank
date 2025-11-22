
import React, { useState, useEffect, useCallback } from 'react';
import { 
    ICreditUnionLogo, 
    LockClosedIcon,
    EnvelopeIcon,
    ArrowRightIcon,
    FingerprintIcon,
    FaceIdIcon,
    SpinnerIcon,
    DevicePhoneMobileIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    QuestionMarkCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon
} from './Icons.tsx';
import { 
    sendSmsNotification, 
    sendTransactionalEmail, 
    generateOtpEmail, 
    generateOtpSms,
    generatePasswordResetEmail,
    generatePasswordResetSms
} from '../services/notificationService.ts';
import { USER_PASSWORD } from '../constants.ts';
import { ReCaptcha } from './ReCaptcha.tsx';

interface WelcomeProps {
  onLogin: () => void;
  onStartCreateAccount: () => void;
}

type LoginStep = 'username' | 'password' | 'recaptcha' | 'security_check' | 'mfa';
type WelcomeView = 'signin' | 'forgot_password' | 'forgot_password_confirmation';

const USER_EMAIL = "mrikimc@gmail.com";
const USER_NAME = "Herbert Lawrence";
const USER_PHONE = "+1-555-012-1234";

const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2940&auto=format&fit=crop", // Original
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940&auto=format&fit=crop", // Corp
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop"  // Lifestyle
];

const securityCheckMessages = [
    'Initializing secure session...',
    'Establishing TLS 1.3 tunnel...',
    'Verifying device fingerprint...',
    'Checking against threat intelligence...',
    'Security handshake complete.'
];

const LoginBackground: React.FC = () => {
    const [bgIndex, setBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
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
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.8)_100%)]"></div>
        </div>
    );
};

export const Welcome: React.FC<WelcomeProps> = ({ onLogin, onStartCreateAccount }) => {
  const [view, setView] = useState<WelcomeView>('signin');
  const [step, setStep] = useState<LoginStep>('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [securityMessageIndex, setSecurityMessageIndex] = useState(0);
  
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricSupportMessage, setBiometricSupportMessage] = useState('Sign in with biometrics');

  useEffect(() => {
    const checkBiometricSupport = async () => {
      try {
        if (!window.PublicKeyCredential || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) {
          setIsBiometricSupported(false);
          setBiometricSupportMessage('Biometrics not supported');
          return;
        }
        setIsBiometricSupported(true);
      } catch (e) {
        console.warn('Biometric support check failed:', e);
        setIsBiometricSupported(false);
        setBiometricSupportMessage('Biometric check failed');
      }
    };
    checkBiometricSupport();
  }, []);


  useEffect(() => {
    if (step === 'security_check') {
      setIsLoading(true);
      const interval = setInterval(() => {
        setSecurityMessageIndex(prev => {
          if (prev >= securityCheckMessages.length - 1) {
            clearInterval(interval);
            setTimeout(async () => {
                const { subject, body } = generateOtpEmail(USER_NAME);
                const emailResult = await sendTransactionalEmail(USER_EMAIL, subject, body);
                const smsResult = await sendSmsNotification(USER_PHONE, generateOtpSms());
                if (!emailResult.success || !smsResult.success) {
                    setError("Failed to send verification code. Please try logging in again.");
                    setStep('password'); 
                } else {
                    setStep('mfa');
                }
            }, 100); 
            return prev;
          }
          return prev + 1;
        });
      }, 150); 
      return () => clearInterval(interval);
    } else {
        setIsLoading(false);
        setSecurityMessageIndex(0);
    }
  }, [step]);
  
  const handleUsernameSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!username.trim()) {
          setError('Please enter your username.');
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          setStep('password');
      }, 400); 
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!password) {
          setError('Please enter your password.');
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
        if (password !== USER_PASSWORD) {
            setError('The password you entered is incorrect. Please try again.');
            setIsLoading(false);
            return;
        }
        setIsLoading(false);
        setStep('recaptcha');
      }, 400); 
  };
  
  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      if (mfaCode.length === 6) {
        onLogin();
      } else {
        setError('Please enter a valid 6-digit code.');
        setIsLoading(false);
      }
    }, 500);
  };
  
  const handleBiometricLogin = useCallback(async () => {
    if (!isBiometricSupported) {
        setError("Biometric authentication is not supported on this browser or device.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const options: PublicKeyCredentialRequestOptions = { challenge, userVerification: 'required' };
        await navigator.credentials.get({ publicKey: options });
        setStep('recaptcha');
    } catch (err: any) {
        setError('Authentication failed or cancelled.');
    } finally {
        setIsLoading(false);
    }
  }, [isBiometricSupported]);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!recoveryEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
        setError('Please enter a valid email address.');
        return;
    }
    setIsLoading(true);
    
    const { subject, body } = generatePasswordResetEmail(USER_NAME, recoveryEmail);
    await sendTransactionalEmail(recoveryEmail, subject, body);
    await sendSmsNotification(USER_PHONE, generatePasswordResetSms());
    
    setIsLoading(false);
    setView('forgot_password_confirmation');
  };

  // Modern Input Component
  const FloatingInput = ({ id, type, value, onChange, label, autoFocus, rightElement }: any) => (
      <div className="relative group">
          <input
              id={id}
              type={type}
              value={value}
              onChange={onChange}
              className="block w-full px-4 pt-5 pb-2 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 focus:bg-slate-900/80 transition-all peer"
              placeholder={label}
              autoFocus={autoFocus}
          />
          <label 
              htmlFor={id} 
              className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-primary-400"
          >
              {label}
          </label>
          {rightElement && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {rightElement}
              </div>
          )}
      </div>
  );

  const renderUsernameStep = () => (
    <div className="animate-fade-in-up space-y-8">
        <div className="text-center">
            <div className="inline-block p-1 mb-6">
                 <ICreditUnionLogo />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-2">Securely access your global portfolio.</p>
        </div>

        <form onSubmit={handleUsernameSubmit} className="space-y-6">
            <FloatingInput 
                id="username" 
                type="text" 
                value={username} 
                onChange={(e: any) => setUsername(e.target.value)} 
                label="User ID" 
                autoFocus 
                rightElement={<UserCircleIcon className="h-5 w-5 text-slate-500" />}
            />

            <div className="flex items-center justify-between px-1">
                 <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                        <div className={`block w-9 h-5 rounded-full transition-colors duration-300 ${rememberMe ? 'bg-primary-600' : 'bg-slate-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 shadow-sm ${rememberMe ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="ml-3 text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Remember User ID</span>
                </label>
                <button type="button" onClick={() => setView('forgot_password')} className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot ID?
                </button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-600 shadow-[0_0_20px_rgba(0,82,255,0.3)] transition-all transform active:scale-[0.98]"
            >
                {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <span className="flex items-center">Continue <ArrowRightIcon className="ml-2 w-4 h-4"/></span>}
            </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs">
                Not a client yet?{' '}
                <button onClick={onStartCreateAccount} className="font-bold text-white hover:text-primary-400 transition-colors">
                    Open an account
                </button>
            </p>
        </div>
    </div>
  );
  
  const renderPasswordStep = () => (
     <div className="animate-fade-in-up space-y-8">
        <div className="text-center">
            <button onClick={() => { setStep('username'); setPassword(''); }} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors flex items-center text-xs font-bold uppercase tracking-wider">
                <ArrowRightIcon className="w-3 h-3 mr-1 transform rotate-180"/> Back
            </button>
             <div className="inline-block mb-4">
                 <ICreditUnionLogo />
            </div>
            <div className="flex flex-col items-center justify-center mb-6">
                 <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-2xl font-bold text-white shadow-inner mb-3">
                    {username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-white">{username}</h3>
                <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400">Verified User</span>
                </div>
            </div>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <FloatingInput 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e: any) => setPassword(e.target.value)} 
                label="Password" 
                autoFocus 
                rightElement={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-300">
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                }
            />
            
            <div className="flex justify-end">
                 <button type="button" onClick={() => setView('forgot_password')} className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot Password?
                </button>
            </div>

            <div className="space-y-4">
                 <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-600 shadow-[0_0_20px_rgba(0,82,255,0.3)] transition-all transform active:scale-[0.98]">
                    {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <span className="flex items-center">Sign In Securely <LockClosedIcon className="ml-2 w-4 h-4"/></span>}
                </button>

                {isBiometricSupported && (
                    <button type="button" onClick={handleBiometricLogin} className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                        {typeof window.ontouchstart !== 'undefined' ? <FaceIdIcon className="w-5 h-5 mr-2 text-primary-400"/> : <FingerprintIcon className="w-5 h-5 mr-2 text-primary-400"/>}
                        <span className="group-hover:text-white transition-colors">{biometricSupportMessage}</span>
                    </button>
                )}
            </div>
        </form>
    </div>
  );
  
  const renderRecaptchaStep = () => (
    <div className="animate-fade-in-up text-center space-y-6">
        <ShieldCheckIcon className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">Security Verification</h3>
        <p className="text-sm text-slate-400">Please complete the check to confirm you are human.</p>
        <div className="flex justify-center py-4">
            <ReCaptcha onVerified={() => setStep('security_check')} />
        </div>
    </div>
  );

  const renderSecurityCheckStep = () => (
    <div className="animate-fade-in-up text-center p-8 space-y-8">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-primary/30">
                <SpinnerIcon className="w-10 h-10 text-primary" />
            </div>
        </div>
        <div>
            <h3 className="text-lg font-bold text-white transition-opacity duration-300 min-h-[28px]" role="status">
                {securityCheckMessages[securityMessageIndex]}
            </h3>
            <div className="w-full max-w-xs mx-auto bg-slate-800 rounded-full h-1 mt-6 overflow-hidden">
                <div 
                    className="bg-primary h-1 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${((securityMessageIndex + 1) / securityCheckMessages.length) * 100}%` }}
                ></div>
            </div>
        </div>
    </div>
  );

  const renderMfaStep = () => (
    <div className="animate-fade-in-up text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full border border-white/10">
            <DevicePhoneMobileIcon className="w-8 h-8 text-white"/>
        </div>
        <div>
            <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Enter the 6-digit code sent to <strong>...1234</strong>.</p>
        </div>
        <form onSubmit={handleMfaSubmit}>
            <input
                type="text"
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-48 mx-auto bg-slate-950 border border-slate-700 text-center text-2xl tracking-[0.5em] rounded-xl p-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono shadow-inner"
                maxLength={6}
                placeholder="------"
                autoFocus
            />
            {error && <p className="mt-4 text-xs text-red-400 bg-red-500/10 py-2 px-3 rounded border border-red-500/20 inline-block">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full mt-8 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all disabled:opacity-70">
                {isLoading ? <SpinnerIcon className="w-5 h-5 mx-auto" /> : 'Verify Identity'}
            </button>
            <button type="button" className="mt-4 text-xs text-slate-500 hover:text-white transition-colors">Didn't receive code? Resend</button>
        </form>
    </div>
  );
  
  const renderForgotPassword = () => (
    <div className="animate-fade-in-up space-y-6">
        <button onClick={() => setView('signin')} className="text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center mb-2 uppercase tracking-wider">
            <ArrowRightIcon className="w-3 h-3 mr-1 transform rotate-180"/> Back
        </button>
        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
        <p className="text-sm text-slate-400">Enter your registered email address to receive secure reset instructions.</p>
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-6 mt-4">
             <FloatingInput 
                id="email" 
                type="email" 
                value={recoveryEmail} 
                onChange={(e: any) => setRecoveryEmail(e.target.value)} 
                label="Email Address" 
                autoFocus 
                rightElement={<EnvelopeIcon className="h-5 w-5 text-slate-500" />}
            />
            {error && <p className="text-xs text-red-400 bg-red-500/10 py-2 px-3 rounded border border-red-500/20">{error}</p>}
             <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all disabled:opacity-70">
                {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Send Reset Link'}
            </button>
        </form>
    </div>
  );

  const renderForgotPasswordConfirmation = () => (
    <div className="animate-fade-in-up text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full ring-1 ring-green-500/50 mb-2">
            <CheckCircleIcon className="w-10 h-10 text-green-400"/>
        </div>
        <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
        <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">We've sent a secure password reset link to <strong className="text-white block mt-1">{recoveryEmail}</strong></p>
        <button onClick={() => setView('signin')} className="w-full py-3.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-white/10 transition-all mt-4">
            Return to Sign In
        </button>
    </div>
  );

  const renderContent = () => {
    switch (view) {
        case 'signin':
            switch(step) {
                case 'username': return renderUsernameStep();
                case 'password': return renderPasswordStep();
                case 'recaptcha': return renderRecaptchaStep();
                case 'security_check': return renderSecurityCheckStep();
                case 'mfa': return renderMfaStep();
            }
        case 'forgot_password': return renderForgotPassword();
        case 'forgot_password_confirmation': return renderForgotPasswordConfirmation();
        default: return null;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <LoginBackground />
        
        {/* Floating Portal Card */}
        <div className="relative z-10 w-full max-w-[420px] perspective-1000">
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 sm:p-10 transition-all duration-500 relative overflow-hidden group">
                
                {/* Security Badge */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-primary opacity-50"></div>
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure: Tier 1</span>
                </div>

                {renderContent()}
                
            </div>
            
            <div className="text-center mt-8 relative z-10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <button 
                    onClick={() => setView('forgot_password')}
                    className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 hover:border-white/30"
                >
                    <QuestionMarkCircleIcon className="w-4 h-4"/>
                    <span>Trouble Logging In?</span>
                </button>
            </div>
        </div>
    </div>
  );
};
