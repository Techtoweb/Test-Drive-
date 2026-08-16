import React from 'react';
import { Star, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react';
import { TESTIMONIALS_DATA, BOOK_DETAILS } from '../data/bookData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 relative font-['Hind_Siliguri',sans-serif]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>সফল পাঠকদের বাস্তব অভিজ্ঞতা</span>
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            যারা বইটি পড়ে নিজের <span className="text-blue-400">বিজনেস স্কেল</span> করেছেন
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            দেশজুড়ে হাজারো ই-কমার্স উদ্যোক্তা আমাদের বই পড়ে নিয়মিত তাদের সেলস রেকর্ড ব্রেক করছেন।
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS_DATA.map((item) => (
            <div 
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 shadow-xl transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1">
                      <span>{item.name}</span>
                      {item.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" title="ভেরিফাইড ক্রেতা" />
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400">{item.role}, {item.location}</p>
                  </div>
                </div>

                {item.monthlyRevenue && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                    {item.monthlyRevenue}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
