import React from 'react';
import { X, BookOpen, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { CHAPTERS_DATA, BOOK_DETAILS } from '../data/bookData';
import { bookCoverImg } from '../assets/images';

interface SneakPeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const SneakPeekModal: React.FC<SneakPeekModalProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
}) => {
  if (!isOpen) return null;

  const sampleChapter = CHAPTERS_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-['Hind_Siliguri',sans-serif]">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                ফ্রি প্রিভিউ স্যাম্পল - {sampleChapter.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {BOOK_DETAILS.title} • {BOOK_DETAILS.author}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-slate-200">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>আপনি বর্তমানে বইটির ফ্রি প্রিভিউ স্যাম্পল অংশ পড়ছেন। সম্পূর্ণ ১০টি অধ্যায় ও ৪টি বোনাস পেতে নিচে অর্ডার করুন।</span>
          </div>

          <div className="prose max-w-none space-y-4 text-xs sm:text-sm leading-relaxed">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <img 
                src={bookCoverImg} 
                alt={BOOK_DETAILS.title} 
                className="w-16 h-24 object-cover rounded-lg shadow-md border border-slate-700 shrink-0" 
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-white not-prose">
                  {sampleChapter.title}
                </h2>
                <p className="text-xs text-slate-400 not-prose">
                  {BOOK_DETAILS.title} • লেখক: {BOOK_DETAILS.author}
                </p>
                <p className="text-xs text-blue-300 italic not-prose pt-1">
                  "{sampleChapter.summary}"
                </p>
              </div>
            </div>

            <div className="space-y-3 whitespace-pre-line text-slate-300 text-justify">
              {sampleChapter.content}
            </div>
          </div>

          {/* Locked Chapters Teaser */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-950 to-blue-950/40 border border-blue-500/30 text-center space-y-4 mt-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">বাকি অধ্যায়সমূহ ও ৪টি এক্সক্লুসিভ বোনাস লক করা আছে</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                উইনিং প্রোডাক্ট রিসার্চ, পাইকারি সাপ্লায়ার কন্টাক্ট ডিরেক্টরি এবং মেটা-টিকটক ১০X স্কেলিং ফর্মুলা আনলক করতে এখনই সম্পূর্ণ বইটি অর্ডার করুন।
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>মাত্র ৳{BOOK_DETAILS.offerPrice} দিয়ে ফুল বই আনলক করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
