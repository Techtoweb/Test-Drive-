import React from 'react';
import { Award, Briefcase, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { BOOK_DETAILS } from '../data/bookData';

export const AuthorSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-950/60 border-y border-slate-900 font-['Hind_Siliguri',sans-serif]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          
          {/* Author Portrait / Avatar Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
              
              <div className="relative w-64 sm:w-72 h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl flex flex-col justify-end p-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-slate-900/40 to-black z-10" />
                
                {/* Visual Avatar Graphic */}
                <div className="absolute inset-0 flex items-center justify-center -top-12">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-inner border-4 border-slate-800">
                    SR
                  </div>
                </div>

                <div className="relative z-20 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
                    {BOOK_DETAILS.author}
                  </h3>
                  <p className="text-xs font-bold text-sky-400">
                    {BOOK_DETAILS.authorTitle}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ভেরিফাইড ই-কমার্স মেন্টর</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Author Story & Achievements */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>লেখক পরিচিতি ও অভিজ্ঞতা</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              কে লিখেছেন <span className="text-blue-400">{BOOK_DETAILS.title}</span> বইটি?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {BOOK_DETAILS.authorBio}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>৭+ বছরের অভিজ্ঞতা</span>
                </div>
                <p className="text-xs text-slate-400">
                  বাংলাদেশি লোকাল মার্কেট ও গ্লোবাল ড্রপশিপিংয়ে দীর্ঘদিনের সফল ক্যারিয়ার।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Briefcase className="w-4 h-4" />
                  <span>৫০+ ব্র্যান্ড মেন্টরিং</span>
                </div>
                <p className="text-xs text-slate-400">
                  নতুন উদ্যোক্তাদের শূন্য থেকে শুরু করে কোটি টাকার বিজনেস মডেলে রূপান্তর।
                </p>
              </div>
            </div>

            <blockquote className="p-4 rounded-xl bg-blue-500/5 border-l-4 border-blue-500 text-xs sm:text-sm text-slate-300 italic">
              "ই-কমার্সে সফল হতে কোনো স্পেশাল ম্যাজিক লাগে না। লাগে সঠিক প্রোডাক্ট সিলেকশন, প্র্যাকটিক্যাল সাপ্লাই চেইন এবং ডাটা নির্ভর মার্কেটিং স্ট্র্যাটেজি—যা আমি এই বইয়ের প্রতিটি পৃষ্ঠায় সহজ ভাষায় তুলে ধরেছি।"
              <span className="block mt-2 font-bold text-blue-400 not-italic">— এস. এম. রায়হান</span>
            </blockquote>
          </div>

        </div>
      </div>
    </section>
  );
};
