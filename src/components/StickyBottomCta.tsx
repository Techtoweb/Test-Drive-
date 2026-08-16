import React from 'react';
import { Zap, Clock, ShieldCheck, ShoppingCart } from 'lucide-react';
import { BOOK_DETAILS } from '../data/bookData';

interface StickyBottomCtaProps {
  onOpenCheckout: () => void;
}

export const StickyBottomCta: React.FC<StickyBottomCtaProps> = ({ onOpenCheckout }) => {
  return (
    <aside aria-label="Quick order checkout bar" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-blue-500/30 p-3 sm:p-4 shadow-2xl font-['Hind_Siliguri',sans-serif]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left price info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <p className="text-[11px] text-slate-400 leading-tight">
              আজকের অফার মূল্য ({BOOK_DETAILS.discountPercentage}% ছাড়):
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                ৳{BOOK_DETAILS.offerPrice}
              </span>
              <span className="text-xs text-slate-500 line-through font-mono">
                ৳{BOOK_DETAILS.regularPrice}
              </span>
            </div>
          </div>

          <div className="sm:hidden">
            <span className="text-base font-black text-white font-mono">
              ৳{BOOK_DETAILS.offerPrice}
            </span>
            <span className="text-[11px] text-slate-400 line-through font-mono ml-1.5">
              ৳{BOOK_DETAILS.regularPrice}
            </span>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অটোমেটিক ইনস্ট্যান্ট অ্যাক্টিভেশন</span>
          </span>
        </div>

        {/* Right CTA Button */}
        <button
          onClick={onOpenCheckout}
          className="flex-1 sm:flex-none py-3 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>এখনই অর্ডার করুন</span>
        </button>

      </div>
    </aside>
  );
};
