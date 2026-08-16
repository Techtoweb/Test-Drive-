import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { CHAPTERS_DATA, BOOK_DETAILS } from '../data/bookData';

interface CurriculumProps {
  onOpenCheckout: () => void;
  onReadChapter: (chapterIndex: number) => void;
}

export const Curriculum: React.FC<CurriculumProps> = ({ onOpenCheckout, onReadChapter }) => {
  const [openChapterId, setOpenChapterId] = useState<number | null>(1);

  const toggleChapter = (id: number) => {
    setOpenChapterId(openChapterId === id ? null : id);
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-950/60 border-y border-slate-900 font-['Hind_Siliguri',sans-serif]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>কমপ্লিট কারিকুলাম ও রোডম্যাপ</span>
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            বইটিতে আপনি <span className="text-blue-400">যা যা শিখবেন</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            ভূমিকা সহ মোট ১০টি পূর্ণাঙ্গ ও প্র্যাকটিক্যাল অধ্যায়ে সাজানো এই বইটিতে ই-কমার্সের উৎপত্তি থেকে শুরু করে উইনিং প্রোডাক্ট রিসার্চ, ড্রপশিপিং, পেইড-অর্গানিক মার্কেটিং এবং গ্লোবাল ব্র্যান্ড স্কেলিং পর্যন্ত প্রতিটি স্টেপ বিস্তারিত আলোচনা করা হয়েছে।
          </p>
        </div>

        {/* Chapters Accordion Grid */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {CHAPTERS_DATA.map((chapter, idx) => {
            const isOpen = openChapterId === chapter.id;

            return (
              <div 
                key={chapter.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen 
                    ? 'border-blue-500/50 bg-slate-900 shadow-xl' 
                    : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                      isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {chapter.id === 0 ? 'ভূমিকা' : String(chapter.id).padStart(2, '0')}
                    </div>

                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white">
                        {chapter.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        {chapter.titleEn} • {chapter.pagesCount} পৃষ্ঠা
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hidden sm:inline">
                      {chapter.highlights.length} টি প্রধান লেসন
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isOpen && (
                  <div className="px-4 pb-6 sm:px-6 sm:pb-6 border-t border-slate-800/80 pt-4 space-y-4">
                    <p className="text-sm text-slate-300 italic bg-blue-500/5 border-l-2 border-blue-500 pl-3 py-1">
                      {chapter.summary}
                    </p>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        এই অধ্যায়ের স্পেশাল টপিকসমূহ:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {chapter.highlights.map((highlight, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Preview Link */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onReadChapter(idx)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>অধ্যায়ের অনলাইন প্রিভিউ পড়ুন</span>
                      </button>

                      <button
                        type="button"
                        onClick={onOpenCheckout}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        সম্পূর্ণ বই আনলক করুন
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onOpenCheckout}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-500/25 inline-flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105"
          >
            <Zap className="w-5 h-5 text-amber-400" />
            <span>মাত্র ৳{BOOK_DETAILS.offerPrice} দিয়ে সম্পূর্ণ বই ও সব বোনাস নিন</span>
          </button>
        </div>

      </div>
    </section>
  );
};
