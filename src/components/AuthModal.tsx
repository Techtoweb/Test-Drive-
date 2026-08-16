import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthModalMode, UserProfile } from '../types';
import { 
  loginWithEmail, 
  signupWithEmail, 
  loginWithGoogle, 
  resetUserPassword 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset states when mode changes
  const switchMode = (newMode: AuthModalMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  if (!isOpen) return null;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('অনুগ্রহ করে আপনার সঠিক ইমেইল এড্রেস লিখুন।');
      return;
    }

    if (mode === 'forgot') {
      try {
        setLoading(true);
        await resetUserPassword(cleanEmail);
        setSuccessMessage(`পাসওয়ার্ড রিসেট লিংকটি "${cleanEmail}" ঠিকানায় পাঠানো হয়েছে। আপনার ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।`);
      } catch (err: any) {
        console.error('Password reset error:', err);
        if (err.code === 'auth/user-not-found') {
          setErrorMessage('এই ইমেইলে কোনো একাউন্ট পাওয়া যায়নি।');
        } else if (err.code === 'auth/invalid-email') {
          setErrorMessage('ইমেইল ঠিকানাটি সঠিক নয়।');
        } else {
          setErrorMessage(err.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('পাসওয়ার্ড প্রদান করা বাধ্যতামূলক।');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('আপনার পূর্ণ নাম লিখুন।');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!');
        return;
      }

      try {
        setLoading(true);
        const user = await signupWithEmail(name.trim(), cleanEmail, password, phone.trim());
        setSuccessMessage('একাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।');
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 1200);
      } catch (err: any) {
        console.error('Signup error:', err);
        if (err.code === 'auth/email-already-in-use') {
          setErrorMessage('এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে। লগইন করার চেষ্টা করুন।');
        } else if (err.code === 'auth/weak-password') {
          setErrorMessage('পাসওয়ার্ড আরও শক্তিশালী করুন (কমপক্ষে ৬ ডিজিট)।');
        } else if (err.code === 'auth/invalid-email') {
          setErrorMessage('ইমেইল ফরম্যাট সঠিক নয়।');
        } else {
          setErrorMessage(err.message || 'সাইন আপ ব্যর্থ হয়েছে, পুনরায় চেষ্টা করুন।');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'login') {
      try {
        setLoading(true);
        const user = await loginWithEmail(cleanEmail, password);
        setSuccessMessage('লগইন সফল হয়েছে! স্বাগতম।');
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 800);
      } catch (err: any) {
        console.error('Login error:', err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setErrorMessage('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় চেক করুন।');
        } else if (err.code === 'auth/too-many-requests') {
          setErrorMessage('অনেকবার ভুল চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
        } else {
          setErrorMessage(err.message || 'লগইন ব্যর্থ হয়েছে, পুনরায় চেষ্টা করুন।');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Google Login
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage(null);
      const user = await loginWithGoogle();
      setSuccessMessage('গুগল দিয়ে সফলভাবে লগইন হয়েছে!');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Hind_Siliguri',sans-serif]">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10 cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            {mode === 'login' && <LogIn className="w-6 h-6" />}
            {mode === 'signup' && <UserPlus className="w-6 h-6" />}
            {mode === 'forgot' && <KeyRound className="w-6 h-6" />}
          </div>
          
          <h3 className="text-2xl font-black tracking-tight text-white">
            {mode === 'login' && 'একাউন্টে লগইন করুন'}
            {mode === 'signup' && 'নতুন একাউন্ট খুলুন'}
            {mode === 'forgot' && 'পাসওয়ার্ড রিসেট করুন'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {mode === 'login' && 'আপনার কেনা বই পড়তে এবং অর্ডার হিস্টোরি দেখতে লগইন করুন'}
            {mode === 'signup' && 'নিরাপদ ই-বুক রিডিং এবং লাইফটাইম এক্সেসের জন্য সাইন আপ করুন'}
            {mode === 'forgot' && 'আপনার একাউন্টের ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট লিংক পাঠাব'}
          </p>
        </div>

        {/* Top Segmented Tab Switcher (Login / Signup) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-5 shadow-inner">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>লগইন (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>সাইন আপ (Sign Up)</span>
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google Quick Button */}
        {mode !== 'forgot' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.2 0 15c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>{googleLoading ? 'কানেক্ট হচ্ছে...' : 'Google দিয়ে সরাসরি লগইন করুন'}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-slate-500 font-medium">অথবা ইমেইল দিয়ে</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Sign Up Fields */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  আপনার পূর্ণ নাম <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  মোবাইল নাম্বার <span className="text-slate-500 font-normal">(বিকাশ/নগদ পেমেন্ট সিঙ্কের জন্য)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ইমেইল এড্রেস <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Password field */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  পাসওয়ার্ড <span className="text-rose-400">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password for signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                কনফার্ম পাসওয়ার্ড <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>প্রসেস করা হচ্ছে...</span>
              </span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'লগইন করুন'}
                  {mode === 'signup' && 'একাউন্ট তৈরি করুন'}
                  {mode === 'forgot' && 'রিসেট লিংক পাঠান'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {mode === 'login' && (
            <p>
              নতুন ব্যবহারকারী?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition-colors cursor-pointer"
              >
                এখনই সাইন আপ করুন
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              ইতিমধ্যে একাউন্ট আছে?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition-colors cursor-pointer"
              >
                লগইন করুন
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              মনে পড়েছে?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition-colors cursor-pointer"
              >
                লগইনে ফিরে যান
              </button>
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit এন্ড-টু-এন্ড এনক্রিপ্টেড ও ফায়ারবেস সিকিউরড</span>
        </div>
      </div>
    </div>
  );
};
