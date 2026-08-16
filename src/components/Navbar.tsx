import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Key, 
  ShoppingCart, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  ShieldCheck,
  CheckCircle2,
  BookMarked
} from 'lucide-react';
import { BOOK_DETAILS } from '../data/bookData';
import { UserProfile, AuthModalMode } from '../types';
import { techToWebLogo } from '../assets/images';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: (mode: AuthModalMode) => void;
  onLogout: () => void;
  onOpenCheckout: () => void;
  onOpenLookup: () => void;
  onOpenPreview: () => void;
  onOpenAdmin?: () => void;
  pendingOrdersCount?: number;
  hasPurchased?: boolean;
  onOpenReader?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenCheckout,
  onOpenLookup,
  onOpenPreview,
  onOpenAdmin,
  pendingOrdersCount = 0,
  hasPurchased = false,
  onOpenReader,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80 font-['Hind_Siliguri',sans-serif]">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
        <span>
          আজকের বিশেষ অফার: মাত্র <strong className="font-bold text-amber-200">৳{BOOK_DETAILS.offerPrice}</strong> (রেগুলার ৳{BOOK_DETAILS.regularPrice}) • বিকাশ ও নগদে ইনস্ট্যান্ট অটোমেটিক ডেলিভারি!
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer py-1 shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img 
            src={techToWebLogo} 
            alt="Tech To Web" 
            className="h-11 sm:h-14 w-auto max-w-[200px] sm:max-w-[320px] object-contain drop-shadow-md hover:scale-105 transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Admin Panel Button (Strictly only visible if techtowebadmin@gmail.com is logged in) */}
          {currentUser?.isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer relative"
              title="অর্ডার ও পেমেন্ট ভেরিফিকেশন প্যানেল"
            >
              <span className="hidden sm:inline">অ্যাডমিন</span>
              <span className="sm:hidden">এডমিন</span>
              {pendingOrdersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* Already Bought Login / Lookup or Direct Read */}
          {hasPurchased && onOpenReader ? (
            <button
              onClick={onOpenReader}
              className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 text-xs font-bold border border-emerald-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>বইটি পড়ুন</span>
            </button>
          ) : (
            <button
              onClick={onOpenLookup}
              className="hidden sm:flex px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/60 transition-colors items-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>বই খুঁজুন</span>
            </button>
          )}

          {/* User Auth Section */}
          {currentUser ? (
            /* Logged In User Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-medium transition-all cursor-pointer"
              >
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName} 
                    className="w-6 h-6 rounded-full object-cover border border-blue-500/50"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline font-semibold">
                  {currentUser.displayName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-white animate-fadeIn">
                  <div className="px-3 py-2.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    {currentUser.isAdmin && (
                      <span className="inline-block mt-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                        সুপার অ্যাডমিন
                      </span>
                    )}
                  </div>

                  <div className="py-1 space-y-0.5">
                    {hasPurchased && onOpenReader && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenReader();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-950/40 rounded-lg flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <BookMarked className="w-4 h-4 text-emerald-400" />
                        <span>আমার কেনা বই পড়ুন</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenLookup();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Key className="w-4 h-4 text-blue-400" />
                      <span>অর্ডার ও এক্সেস কোড চেক</span>
                    </button>

                    {onOpenAdmin && currentUser.isAdmin && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/40 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>অ্যাডমিন ড্যাশবোর্ড</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 rounded-lg flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>লগআউট (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out: Single Clean Login button */
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="লগইন বা সাইন আপ করুন"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span>লগইন</span>
            </button>
          )}

          {/* Direct Buy Now CTA */}
          <button
            onClick={onOpenCheckout}
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 border border-blue-400/30 flex items-center gap-1.5 transition-all cursor-pointer transform active:scale-95 shrink-0"
          >
            <ShoppingCart className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>অর্ডার করুন</span>
            <span className="hidden md:inline bg-white/20 px-1.5 py-0.5 rounded text-[11px]">৳{BOOK_DETAILS.offerPrice}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

