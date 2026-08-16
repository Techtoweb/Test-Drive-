import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FAQS_DATA } from '../data/bookData';

export const FaqSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-950/60 border-t border-slate-900 font-['Hind_Siliguri',sans-serif]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>সচরাচর জিজ্ঞাসিত প্রশ্নাবলী</span>
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            আপনার মনের কিছু <span className="text-blue-400">সাধারণ প্রশ্নের উত্তর</span>
          </h2>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {FAQS_DATA.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen 
                    ? 'border-blue-500/40 bg-slate-900' 
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-white">
                    {faq.question}
                  </span>
                  <div className="shrink-0 text-blue-400">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-300 border-t border-slate-800/80 pt-3 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
