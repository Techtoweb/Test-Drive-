import React from 'react';
import { BookOpen, ShieldCheck, Key, LogIn, UserPlus } from 'lucide-react';
import { BOOK_DETAILS } from '../data/bookData';
import { AuthModalMode, UserProfile } from '../types';
import { techToWebLogo } from '../assets/images';

interface FooterProps {
  onOpenCheckout: () => void;
  onOpenLookup: () => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: (mode: AuthModalMode) => void;
  currentUser?: UserProfile | null;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCheckout,
  onOpenLookup,
  onOpenAdmin,
  onOpenAuth,
  currentUser,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-28 sm:pb-20 font-['Hind_Siliguri',sans-serif] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={techToWebLogo} 
                alt="Tech To Web" 
                className="h-12 sm:h-14 w-auto max-w-[260px] object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {BOOK_DETAILS.title} — {BOOK_DETAILS.subtitleBn}। এই বইটি লেখক এস. এম. রায়হানের দীর্ঘ ৭+ বছরের বাস্তব অভিজ্ঞতার নির্যাস।
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                কপিরাইট © ২০২৬ সকল স্বত্ব সংরক্ষিত
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenCheckout} className="hover:text-blue-400 transition-colors cursor-pointer">
                  বইটি অর্ডার করুন (অফার মূল্য ৳{BOOK_DETAILS.offerPrice})
                </button>
              </li>
              <li>
                <button onClick={onOpenLookup} className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>আগের কেনা বই খুঁজুন</span>
                </button>
              </li>
              {onOpenAuth && !currentUser && (
                <li>
                  <button onClick={() => onOpenAuth('login')} className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer">
                    <LogIn className="w-3.5 h-3.5 text-blue-400" />
                    <span>লগইন / সাইন আপ (Login)</span>
                  </button>
                </li>
              )}
              {currentUser?.isAdmin && onOpenAdmin && (
                <li>
                  <button onClick={onOpenAdmin} className="hover:text-amber-400 text-amber-500/80 transition-colors flex items-center gap-1 cursor-pointer font-medium">
                    <span>অ্যাডমিন ও অর্ডার ভেরিফিকেশন প্যানেল</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Payment & Security Info */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              নিরাপদ পেমেন্ট ও সুরক্ষা
            </h4>
            <p className="text-xs leading-relaxed">
              আমরা বাংলাদেশি সকল মোবাইল ব্যাংকিং (বিকাশ, নগদ, রকেট, উপায়) সাপোর্ট করি এবং পেমেন্ট সম্পন্ন হওয়ামাত্র স্বয়ংক্রিয়ভাবে অর্ডার কনফার্ম করে লাইসেন্স দিয়ে থাকি।
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ডিজিটাল পাইরেসি ও কপিরাইট সুরক্ষিত অনলাইন রিডার</span>
            </div>
          </div>

        </div>

        {/* Bottom micro notice */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            {BOOK_DETAILS.title} by {BOOK_DETAILS.author} • E-Commerce Business Expert
          </p>
          <p className="flex items-center gap-1">
            <span>Powered by E-Commerce 360 Platform</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
