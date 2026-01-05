import React, { useState, useEffect, useRef } from 'react';
import {
    X, Eye, EyeOff, Sparkles, Check, AlertCircle, ShieldCheck, Mail, RefreshCw,
    ArrowLeft, User, Briefcase, Building, Upload, Globe, Lock, Shield,
    ChevronRight, Camera, AlertTriangle, Smartphone, MapPin, Monitor, Key, FileText, Hash, CheckCircle
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DISPOSABLE_DOMAINS = ['tempmail.com', '10minutemail.com', 'mailinator.com', 'throwawaymail.com'];
const COMMON_PASSWORDS = ['password', '123456', 'qwerty', 'admin', 'welcome'];
const DEPARTMENTS = ['Engineering', 'Security', 'Operations', 'Marketing', 'Sales', 'HR', 'Finance', 'Legal', 'IT', 'Product', 'Executive', 'Other'];

type AuthStage = 'AUTH' | 'VERIFY' | 'PROFILE' | 'LOCKED' | 'FORGOT_PASSWORD' | 'RESET_SENT' | 'RESET_FORM' | 'RESET_SUCCESS' | '2FA';
type TwoFactorMethod = 'TOTP' | 'SMS' | 'EMAIL' | 'BACKUP';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { showToast } = useToast();
    const [stage, setStage] = useState<AuthStage>('AUTH');
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // --- AUTH FORM STATE ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [rememberDevice, setRememberDevice] = useState(false);

    // --- VALIDATION & SECURITY STATE ---
    const [emailError, setEmailError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-gray-200' });
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaInput, setCaptchaInput] = useState('');
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    // --- VERIFICATION STATE ---
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(600);
    const [resendCooldown, setResendCooldown] = useState(60);
    const [attempts, setAttempts] = useState(3);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // --- 2FA STATE ---
    const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod>('TOTP');
    const [backupCodeInput, setBackupCodeInput] = useState('');
    const [trustDevice, setTrustDevice] = useState(false);
    const [twoFactorOtp, setTwoFactorOtp] = useState(['', '', '', '', '', '']);
    const twoFactorRefs = useRef<(HTMLInputElement | null)[]>([]);

    // --- PROFILE WIZARD STATE ---
    const [profileStep, setProfileStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [displayNameAvailable, setDisplayNameAvailable] = useState<boolean | null>(null);
    const [jobTitle, setJobTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [company, setCompany] = useState('');
    const [companySize, setCompanySize] = useState('11-50');
    const [avatarOption, setAvatarOption] = useState<'upload' | 'preset' | 'gravatar'>('preset');
    const [timezone, setTimezone] = useState('UTC');
    const [theme, setTheme] = useState('dark');
    const [setup2FA, setSetup2FA] = useState(false);

    // --- TIMERS ---
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if ((stage === 'VERIFY' || (stage === '2FA' && twoFactorMethod !== 'BACKUP') || stage === 'RESET_SENT') && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [stage, timeLeft, twoFactorMethod]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if ((stage === 'VERIFY' || stage === '2FA' || stage === 'RESET_SENT') && resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown(p => p - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [stage, resendCooldown]);

    useEffect(() => {
        if (lockoutTimer > 0) {
            const timer = setInterval(() => setLockoutTimer(p => p - 1), 1000);
            return () => clearInterval(timer);
        } else if (isLocked && lockoutTimer === 0) {
            setIsLocked(false);
            setLoginAttempts(0);
        }
    }, [lockoutTimer, isLocked]);

    // --- EVENT LISTENERS ---
    // --- FOCUS TRAPPING ---
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleFocusTrap = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleFocusTrap);
        return () => window.removeEventListener('keydown', handleFocusTrap);
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: Event) => {
            try {
                const keyEvent = e as KeyboardEvent;
                if (keyEvent && keyEvent.getModifierState) {
                    setCapsLockOn(keyEvent.getModifierState('CapsLock'));
                }
            } catch {
                // Ignore caps lock detection errors
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return null;

    // --- HELPERS ---
    const validateEmail = (value: string) => {
        // RFC 5322 compliant regex
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;
        if (!emailRegex.test(value)) return 'Invalid email format';
        const domain = value.split('@')[1];
        if (DISPOSABLE_DOMAINS.includes(domain)) return 'Disposable domains not allowed';
        return '';
    };

    const validatePhone = (value: string) => {
        // E.164 international format
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(value)) return 'Use E.164 format (e.g. +1234567890)';
        return '';
    };

    const calculatePasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 12) score += 25; else if (pass.length >= 8) score += 10;
        let complexity = 0;
        if (/[A-Z]/.test(pass)) complexity += 10;
        if (/[a-z]/.test(pass)) complexity += 5;
        if (/[0-9]/.test(pass)) complexity += 5;
        if (/[^A-Za-z0-9]/.test(pass)) complexity += 5;
        score += Math.min(25, complexity);
        if (new Set(pass.split('')).size > 8) score += 25; else if (new Set(pass.split('')).size > 5) score += 15;
        if (COMMON_PASSWORDS.some(cp => pass.toLowerCase().includes(cp))) score -= 50;
        score = Math.max(0, Math.min(100, score));
        let label = 'Weak', color = 'bg-red-500';
        if (score > 80) { label = 'Strong'; color = 'bg-blue-500'; }
        else if (score > 60) { label = 'Good'; color = 'bg-green-500'; }
        else if (score > 40) { label = 'Fair'; color = 'bg-yellow-500'; }
        setPasswordStrength({ score, label, color });
    };

    // --- HANDLERS ---
    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLogin) {
            if (isLocked) {
                showToast(`Account locked. Try again in ${lockoutTimer}s`, 'error');
                return;
            }
            if (showCaptcha && captchaInput !== '8X2B') {
                showToast('Invalid CAPTCHA', 'error');
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8082/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    setIsLoading(false);
                    const newAttempts = loginAttempts + 1;
                    setLoginAttempts(newAttempts);

                    if (newAttempts >= 10) {
                        setIsLocked(true);
                        setLockoutTimer(900);
                        showToast('Too many failed attempts. Account locked.', 'error');
                    } else if (newAttempts >= 3) {
                        setShowCaptcha(true);
                        showToast(data.error || 'Invalid credentials', 'error');
                    } else {
                        showToast(data.error || 'Invalid email or password', 'error');
                    }
                    return;
                }

                // Success
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_data', JSON.stringify(data.user));

                setIsLoading(false);
                setLoginAttempts(0);
                showToast('Successfully signed in!', 'success');
                onClose();
            } catch (err) {
                setIsLoading(false);
                showToast('Back-end is unreachable. Please ensure the server is running.', 'error');
            }
        } else {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8082/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        profile: { fullName, jobTitle, department, company }
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    setIsLoading(false);
                    showToast(data.error || 'Signup failed', 'error');
                    return;
                }

                setIsLoading(false);
                setStage('VERIFY');
                setTimeLeft(600);
                showToast('Verification code sent', 'info');
                const domain = email.split('@')[1];
                if (domain && !DISPOSABLE_DOMAINS.includes(domain)) {
                    setCompany(domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1));
                }
            } catch (err) {
                setIsLoading(false);
                showToast('Server connection failed', 'error');
            }
        }
    };

    const handleVerifySubmit = (code: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            if (code === '123456') {
                showToast('Email verified!', 'success');
                setStage('PROFILE');
            } else {
                showToast('Invalid code', 'error');
                setOtp(Array(6).fill(''));
                otpRefs.current[0]?.focus();
            }
        }, 1000);
    };

    const handle2FASubmit = (code: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            if (code === '123456' || (twoFactorMethod === 'BACKUP' && code.length === 8)) {
                showToast('Successfully signed in!', 'success');
                onClose();
            } else {
                showToast('Invalid code', 'error');
                if (twoFactorMethod === 'BACKUP') setBackupCodeInput('');
                else {
                    setTwoFactorOtp(Array(6).fill(''));
                    twoFactorRefs.current[0]?.focus();
                }
            }
        }, 1000);
    };

    const handleResetRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStage('RESET_SENT');
            setTimeLeft(120); // 2 minutes before resend
            showToast('Reset link sent to your email', 'success');
        }, 1500);
    };

    const handleNewPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStage('RESET_SUCCESS');
            showToast('Password successfully reset', 'success');
            // Auto-redirect to login
            setTimeout(() => {
                setStage('AUTH');
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
                setEmail(''); // Clear for security or optional
            }, 3000);
        }, 1500);
    };

    const handleProfileNext = () => {
        if (profileStep < 4) setProfileStep(p => p + 1);
        else {
            showToast('Account setup complete!', 'success');
            onClose();
        }
    };

    const handleCheckDisplayName = (name: string) => {
        setDisplayName(name);
        setDisplayNameAvailable(null);
        if (name.length > 2) {
            setTimeout(() => setDisplayNameAvailable(name.toLowerCase() !== 'admin'), 500);
        }
    };

    // --- RENDERERS ---

    const renderAuth = () => (
        <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg shadow-lg">
                    <Sparkles size={16} className="text-yellow-400" />
                    <span className="font-bold tracking-wide">Clevora AI</span>
                </div>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-xl font-bold">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
            </div>

            {isLocked && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 text-sm mb-4">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">Account Locked</span>
                        <p>Too many failed attempts. Try again in {Math.floor(lockoutTimer / 60)}m {lockoutTimer % 60}s.</p>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-gray-700 uppercase mb-1">Email / Username</label>
                {isLogin ? (
                    <input
                        key="login-email"
                        id="auth-email-login"
                        type="text"
                        value={email}
                        onChange={e => { setEmail(e.target.value.trim()); }}
                        className={`w-full p-3 rounded-xl border border-gray-200 focus:border-black outline-none transition-all`}
                        placeholder="name@company.com"
                        required
                        autoComplete="username"
                    />
                ) : (
                    <input
                        key="signup-email"
                        id="auth-email-signup"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value.trim()); setEmailError(validateEmail(e.target.value)); }}
                        className={`w-full p-3 rounded-xl border ${emailError ? 'border-red-500' : 'border-gray-200'} focus:border-black outline-none transition-all`}
                        placeholder="name@company.com"
                        required
                        autoComplete="email"
                    />
                )}
                {!isLogin && emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                {isLogin && <p className="text-xs text-gray-400 mt-1">Tip: Use '2fa@test.com' to test 2FA flow</p>}
            </div>

            <div>
                <label htmlFor="auth-password" className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                <div className="relative">
                    {isLogin ? (
                        <input
                            key="login-pass"
                            id="auth-password-login"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={`w-full p-3 rounded-xl border ${capsLockOn ? 'border-yellow-400' : 'border-gray-200'} focus:border-black outline-none transition-all`}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    ) : (
                        <input
                            key="signup-pass"
                            id="auth-password-signup"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => { setPassword(e.target.value); calculatePasswordStrength(e.target.value); }}
                            className={`w-full p-3 rounded-xl border ${capsLockOn ? 'border-yellow-400' : 'border-gray-200'} focus:border-black outline-none transition-all`}
                            placeholder="Min 12 chars"
                            required
                            autoComplete="new-password"
                        />
                    )}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {capsLockOn && <div className="absolute right-10 top-3 text-yellow-500 text-xs font-bold flex items-center gap-1"><ArrowLeft size={12} className="rotate-90" /> CAPS ON</div>}
                </div>
                {!isLogin && password && (
                    <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <svg width="100%" height="4" className="block">
                            <rect width={`${passwordStrength.score}%`} height="100%" className={`${passwordStrength.color} transition-all duration-300`} />
                        </svg>
                    </div>
                )}
            </div>

            {isLogin && (
                <>
                    {showCaptcha && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase text-gray-500">Security Check</span>
                                <div className="font-mono text-lg font-bold tracking-widest bg-white border px-3 py-1 rounded">8X2B</div>
                            </div>
                            <input
                                value={captchaInput}
                                onChange={e => setCaptchaInput(e.target.value)}
                                placeholder="Enter code"
                                className="w-full p-2 border rounded-lg text-sm"
                                aria-label="Enter CAPTCHA code"
                            />
                        </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded border-gray-300 text-black focus:ring-black" />
                            <label htmlFor="remember" className="text-gray-600">Remember me</label>
                        </div>
                        <button type="button" onClick={() => setStage('FORGOT_PASSWORD')} className="font-bold text-black border-b border-white hover:border-black transition-all">Forgot password?</button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <input type="checkbox" id="device" checked={rememberDevice} onChange={e => setRememberDevice(e.target.checked)} className="rounded border-gray-300 text-black focus:ring-black" />
                        <label htmlFor="device" className="flex items-center gap-1"><Monitor size={14} /> Remember this device</label>
                    </div>
                </>
            )}

            {!isLogin && (
                <>
                    <div>
                        <label htmlFor="auth-confirm-password" className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm Password</label>
                        <input id="auth-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`w-full p-3 rounded-xl border ${confirmPassword && confirmPassword !== password ? 'border-red-500' : 'border-gray-200'} outline-none`} placeholder="••••••••" required />
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" id="terms" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 rounded border-gray-300 shrink-0" />
                        <label htmlFor="terms" className="text-xs text-gray-600">I agree to the Terms of Service & Privacy Policy</label>
                    </div>
                </>
            )}

            <button
                type="submit"
                disabled={isLoading || isLocked || (!isLogin && (!termsAccepted || !!emailError || password !== confirmPassword))}
                className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isLogin ? 'Signing In...' : 'Processing...'}</>
                ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                )}
            </button>

            <div className="text-center mt-4 pt-4 border-t">
                <button type="button" onClick={() => { setIsLogin(!isLogin); setEmailError(''); setShowCaptcha(false); }} className="text-sm font-bold border-b border-transparent hover:border-black transition-all">
                    {isLogin ? 'New to Clevora? Create account' : 'Already have an ID? Sign in'}
                </button>
            </div>
        </form>
    );

    const renderVerify = () => (
        <div className="text-center animate-in slide-in-from-right duration-300">
            <button onClick={() => setStage('AUTH')} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-black" aria-label="Back" title="Back"><ArrowLeft size={20} /></button>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Mail size={32} /></div>
            <h2 className="text-xl font-bold mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-6">Sent to <span className="font-mono text-black">{email.replace(/(^.{3}).+(@.+)/, '$1***$2')}</span></p>
            <div className="flex justify-center gap-2 mb-6">
                {otp.map((d, i) => (
                    <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" maxLength={1} value={d}
                        aria-label={`Digit ${i + 1}`}
                        onChange={e => {
                            if (!/^\d*$/.test(e.target.value)) return;
                            const newOtp = [...otp]; newOtp[i] = e.target.value; setOtp(newOtp);
                            if (e.target.value && i < 5) otpRefs.current[i + 1]?.focus();
                            if (newOtp.every(x => x)) handleVerifySubmit(newOtp.join(''));
                        }}
                        onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); }}
                        className="w-12 h-14 text-center text-xl font-bold border rounded-lg focus:border-black outline-none"
                    />
                ))}
            </div>
            <div className="mb-4 text-sm font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
            <button onClick={() => { setResendCooldown(60); setAttempts(p => p - 1); showToast('Resent', 'info'); }} disabled={resendCooldown > 0 || attempts === 0} className="text-blue-600 text-sm font-bold disabled:text-gray-400">Resend Code ({attempts} left)</button>
        </div>
    );

    const render2FA = () => {
        const getIcon = () => {
            switch (twoFactorMethod) {
                case 'TOTP': return <Smartphone size={32} />;
                case 'SMS': return <Hash size={32} />;
                case 'EMAIL': return <Mail size={32} />;
                case 'BACKUP': return <Key size={32} />;
            }
        };

        const getTitle = () => {
            switch (twoFactorMethod) {
                case 'TOTP': return 'Authenticator App';
                case 'SMS': return 'Text Message';
                case 'EMAIL': return 'Email Code';
                case 'BACKUP': return 'Backup Code';
            }
        };

        const getDescription = () => {
            switch (twoFactorMethod) {
                case 'TOTP': return 'Enter the 6-digit code from your app';
                case 'SMS': return 'Enter code sent to +1 (***) ***-1234';
                case 'EMAIL': return `Enter code sent to ${email.replace(/(^.{3}).+(@.+)/, '$1***$2')}`;
                case 'BACKUP': return 'Enter one of your 8-character backup codes';
            }
        };

        return (
            <div className="text-center animate-in slide-in-from-right duration-300">
                <button onClick={() => setStage('AUTH')} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-black" aria-label="Back" title="Back"><ArrowLeft size={20} /></button>

                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                    {getIcon()}
                </div>

                <h2 className="text-xl font-bold mb-2">{getTitle()}</h2>
                <p className="text-gray-500 text-sm mb-6">{getDescription()}</p>

                {twoFactorMethod === 'BACKUP' ? (
                    <input
                        type="text"
                        value={backupCodeInput}
                        onChange={e => {
                            const val = e.target.value.toUpperCase();
                            setBackupCodeInput(val);
                            if (val.length === 8) handle2FASubmit(val);
                        }}
                        placeholder="ABC123XY"
                        className="w-full text-center text-2xl font-mono tracking-widest p-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500 uppercase mb-6"
                        maxLength={8}
                        aria-label="Backup code"
                    />
                ) : (
                    <div className="flex justify-center gap-2 mb-6">
                        {twoFactorOtp.map((d, i) => (
                            <input key={i} ref={(el) => { twoFactorRefs.current[i] = el; }} type="text" maxLength={1} value={d}
                                aria-label={`Digit ${i + 1}`}
                                onChange={e => {
                                    if (!/^\d*$/.test(e.target.value)) return;
                                    const newOtp = [...twoFactorOtp]; newOtp[i] = e.target.value; setTwoFactorOtp(newOtp);
                                    if (e.target.value && i < 5) twoFactorRefs.current[i + 1]?.focus();
                                    if (newOtp.every(x => x)) handle2FASubmit(newOtp.join(''));
                                }}
                                onKeyDown={e => { if (e.key === 'Backspace' && !twoFactorOtp[i] && i > 0) twoFactorRefs.current[i - 1]?.focus(); }}
                                className="w-12 h-14 text-center text-xl font-bold border rounded-lg focus:border-purple-500 outline-none"
                            />
                        ))}
                    </div>
                )}

                {twoFactorMethod !== 'BACKUP' && (
                    <div className="mb-4 text-sm font-bold flex items-center justify-center gap-2">
                        <RefreshCw size={14} className={resendCooldown > 0 ? "animate-spin" : ""} />
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => setTrustDevice(!trustDevice)}>
                    <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${trustDevice ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                        {trustDevice && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-sm text-gray-600 select-none">Trust this device for 30 days</span>
                </div>

                <div className="border-t pt-4">
                    <p className="text-xs font-bold text-gray-500 mb-3 uppercase">Try another method</p>
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => setTwoFactorMethod('TOTP')} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${twoFactorMethod === 'TOTP' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'hover:bg-gray-50'}`} title="Authenticator"><Smartphone size={16} /><span className="text-[10px] font-bold">App</span></button>
                        <button onClick={() => setTwoFactorMethod('SMS')} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${twoFactorMethod === 'SMS' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'hover:bg-gray-50'}`} title="SMS"><Hash size={16} /><span className="text-[10px] font-bold">Text</span></button>
                        <button onClick={() => setTwoFactorMethod('EMAIL')} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${twoFactorMethod === 'EMAIL' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'hover:bg-gray-50'}`} title="Email"><Mail size={16} /><span className="text-[10px] font-bold">Email</span></button>
                        <button onClick={() => setTwoFactorMethod('BACKUP')} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${twoFactorMethod === 'BACKUP' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'hover:bg-gray-50'}`} title="Backup Codes"><Key size={16} /><span className="text-[10px] font-bold">Code</span></button>
                    </div>
                </div>
            </div>
        );
    };

    const renderProfileWizard = () => (
        <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
                <div><h2 className="text-xl font-bold">Profile Setup</h2><p className="text-xs text-gray-500">Step {profileStep} of 4</p></div>
                <div className="flex gap-1">{[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 w-8 rounded-full ${s <= profileStep ? 'bg-black' : 'bg-gray-200'}`} />)}</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {profileStep === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label htmlFor="fn" className="text-xs font-bold uppercase block mb-1">Full Name</label><input id="fn" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 border rounded-xl outline-none" placeholder="John Doe" /></div>
                            <div>
                                <label htmlFor="un" className="text-xs font-bold uppercase block mb-1">Username</label>
                                <div className="relative">
                                    <input id="un" value={displayName} onChange={e => handleCheckDisplayName(e.target.value)} className={`w-full p-3 border rounded-xl outline-none ${displayNameAvailable === false ? 'border-red-500' : displayNameAvailable ? 'border-green-500' : ''}`} placeholder="jdoe" />
                                    {displayNameAvailable !== null && <div className="absolute right-3 top-3">{displayNameAvailable ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</div>}
                                </div>
                            </div>
                        </div>
                        <div><label htmlFor="jt" className="text-xs font-bold uppercase block mb-1">Job Title</label><input id="jt" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full p-3 border rounded-xl outline-none" placeholder="Software Engineer" /></div>
                        <div><label htmlFor="dept" className="text-xs font-bold uppercase block mb-1">Department</label><select id="dept" value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-3 border rounded-xl outline-none bg-white"><option value="">Select...</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label htmlFor="comp" className="text-xs font-bold uppercase block mb-1">Company</label><input id="comp" value={company} onChange={e => setCompany(e.target.value)} className="w-full p-3 border rounded-xl outline-none" /></div>
                            <div><label htmlFor="sz" className="text-xs font-bold uppercase block mb-1">Size</label><select id="sz" value={companySize} onChange={e => setCompanySize(e.target.value)} className="w-full p-3 border rounded-xl outline-none bg-white"><option>1-10</option><option>11-50</option><option>51-200</option><option>201-1000</option><option>1000+</option></select></div>
                        </div>
                    </div>
                )}

                {profileStep === 2 && (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg relative">
                            {avatarOption === 'upload' ? <User size={40} className="text-gray-400" /> : avatarOption === 'gravatar' ? <img src={`https://www.gravatar.com/avatar/${btoa(email)}?d=identicon`} alt="User Avatar" className="w-full h-full rounded-full" /> : <div className="text-2xl font-bold text-gray-700 text-center flex items-center justify-center w-full h-full bg-blue-100 rounded-full">{fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AU'}</div>}
                            <button className="absolute bottom-0 right-0 p-1.5 bg-black text-white rounded-full hover:bg-gray-800" title="Change Avatar" aria-label="Change Avatar"><Camera size={14} /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setAvatarOption('preset')} className={`p-3 rounded-xl border text-sm font-medium ${avatarOption === 'preset' ? 'border-black bg-black text-white' : 'hover:bg-gray-50'}`}>Initials</button>
                            <button onClick={() => setAvatarOption('upload')} className={`p-3 rounded-xl border text-sm font-medium ${avatarOption === 'upload' ? 'border-black bg-black text-white' : 'hover:bg-gray-50'}`}>Upload</button>
                            <button onClick={() => setAvatarOption('gravatar')} className={`p-3 rounded-xl border text-sm font-medium ${avatarOption === 'gravatar' ? 'border-black bg-black text-white' : 'hover:bg-gray-50'}`}>Gravatar</button>
                        </div>
                    </div>
                )}

                {profileStep === 3 && (
                    <div className="space-y-4">
                        <div><label htmlFor="tz" className="text-xs font-bold uppercase block mb-1">Timezone</label><select id="tz" value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full p-3 border rounded-xl outline-none bg-white"><option value="UTC">UTC (Universal Time)</option><option value="EST">EST (New York)</option><option value="PST">PST (Los Angeles)</option><option value="GMT">GMT (London)</option></select></div>
                        <div>
                            <label className="text-xs font-bold uppercase block mb-1">Theme</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['light', 'dark', 'auto'].map(t => (
                                    <button key={t} onClick={() => setTheme(t)} className={`p-4 border rounded-xl text-center capitalize ${theme === t ? 'border-black ring-1 ring-black bg-gray-50' : 'hover:bg-gray-50'}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {profileStep === 4 && (
                    <div className="space-y-6 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600"><ShieldCheck size={32} /></div>
                        <div><h3 className="font-bold text-lg">Secure your account</h3><p className="text-gray-500 text-sm">Enable 2-Factor Authentication (Recommended)</p></div>
                        <div onClick={() => setSetup2FA(!setup2FA)} className={`cursor-pointer p-4 border rounded-xl flex items-center gap-4 text-left transition-all ${setup2FA ? 'border-green-500 bg-green-50/50' : 'hover:border-gray-300'}`}>
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${setup2FA ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>{setup2FA && <Check size={14} className="text-white" />}</div>
                            <div><div className="font-bold text-sm">Authenticator App</div><div className="text-xs text-gray-500">Use Google/Microsoft Authenticator</div></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
                {profileStep > 1 ? <button onClick={() => setProfileStep(p => p - 1)} className="text-sm font-bold text-gray-500 hover:text-black">Back</button> : <button className="invisible" title="Back" aria-label="Back">Back</button>}
                <button onClick={handleProfileNext} className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 flex items-center gap-2">{profileStep === 4 ? 'Finish' : 'Next'} <ChevronRight size={16} /></button>
            </div>
        </div>
    );

    const renderForgotPassword = () => (
        <form onSubmit={handleResetRequest} className="text-center animate-in slide-in-from-right duration-300">
            <button type="button" onClick={() => setStage('AUTH')} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-black" aria-label="Back" title="Back"><ArrowLeft size={20} /></button>
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600"><Lock size={32} /></div>
            <h2 className="text-xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you instructions.</p>
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full p-3 rounded-xl border border-gray-200 mb-4 outline-none focus:border-black"
                aria-label="Email address"
                autoComplete="email"
            />
            <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-all">{isLoading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
    );

    const renderResetSent = () => (
        <div className="text-center animate-in slide-in-from-right duration-300">
            <button onClick={() => setStage('AUTH')} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-black" aria-label="Back" title="Back"><ArrowLeft size={20} /></button>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Mail size={32} /></div>
            <h2 className="text-xl font-bold mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-6">Reset instructions sent to <span className="font-bold">{email}</span></p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm text-gray-600">
                Didn't receive it? Check spam folder or try again in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>

            {/* Dev-only simulation button */}
            <button onClick={() => setStage('RESET_FORM')} className="w-full bg-gray-100 text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all mb-2">(Dev) Simulate Click Link</button>

            <button onClick={() => setStage('AUTH')} className="text-sm font-bold border-b border-transparent hover:border-black">Return to Sign In</button>
        </div>
    );

    const renderResetForm = () => (
        <form onSubmit={handleNewPasswordSubmit} className="animate-in slide-in-from-right duration-300">
            <button type="button" onClick={() => setStage('AUTH')} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-black" aria-label="Back" title="Back"><ArrowLeft size={20} /></button>
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">New Password</h2>
                <p className="text-gray-500 text-sm">Create a strong password for your account</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="new-password" className="block text-xs font-bold text-gray-700 uppercase mb-1">New Password</label>
                    <div className="relative">
                        <input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => { setPassword(e.target.value); calculatePasswordStrength(e.target.value); }}
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-black"
                            required
                            placeholder="Min 12 chars"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" aria-label="Toggle password visibility">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {password && (
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <svg width="100%" height="4" className="block">
                                <rect width={`${passwordStrength.score}%`} height="100%" className={`${passwordStrength.color} transition-all duration-300`} />
                            </svg>
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="confirm-new-password" className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm Password</label>
                    <input
                        id="confirm-new-password"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={`w-full p-3 rounded-xl border ${confirmPassword && confirmPassword !== password ? 'border-red-500' : 'border-gray-200'} outline-none focus:border-black`}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" disabled={isLoading || passwordStrength.score < 40 || password !== confirmPassword} className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 mt-4">
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
            </div>
        </form>
    );

    const renderResetSuccess = () => (
        <div className="text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><CheckCircle size={32} /></div>
            <h2 className="text-xl font-bold mb-2">Password Reset</h2>
            <p className="text-gray-500 text-sm mb-6">Your password has been successfully updated.</p>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-6">Redirecting to login in 3s...</div>
            <button onClick={() => { setStage('AUTH'); setIsLogin(true); }} className="w-full bg-black text-white font-bold py-3 rounded-xl">Sign In Now</button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-300 z-10" aria-label="Close modal" title="Close"><X size={20} /></button>
                <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                    {stage === 'AUTH' && renderAuth()}
                    {stage === 'VERIFY' && renderVerify()}
                    {stage === 'PROFILE' && renderProfileWizard()}
                    {stage === 'FORGOT_PASSWORD' && renderForgotPassword()}
                    {stage === 'RESET_SENT' && renderResetSent()}
                    {stage === 'RESET_FORM' && renderResetForm()}
                    {stage === 'RESET_SUCCESS' && renderResetSuccess()}
                    {stage === '2FA' && render2FA()}
                </div>
            </div>
        </div>
    );
}
