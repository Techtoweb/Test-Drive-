import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Zap, Star, ShieldCheck, Sparkles, BookOpen, 
  ArrowRight, Clock, Award, Users, Lock, Smartphone
} from 'lucide-react';
import { BookCover } from './BookCover';
import { BOOK_DETAILS } from '../data/bookData';

interface HeroProps {
  onOpenCheckout: () => void;
  onOpenPreview: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCheckout, onOpenPreview }) => {
  // Live Countdown Timer (Simulating limited time offer)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 font-['Hind_Siliguri',sans-serif]">
      {/* Dynamic Background Glows & Grid */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Compelling Sales Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>২০২৬ সালের সেরা ই-কমার্স মাস্টারবুক</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{BOOK_DETAILS.rating}/৫ ({BOOK_DETAILS.reviewsCount}+ রিভিউ)</span>
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                জিরো থেকে শুরু করে লাভজনক <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">ই-কমার্স ও ড্রপশিপিং</span> বিজনেস গড়ার সম্পূর্ণ গাইডলাইন!
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed pt-2">
                সঠিক প্রোডাক্ট রিসার্চ, পাইকারি রেটে সোর্সিং, হাই-কনভার্টিং ল্যান্ডিং পেজ তৈরি এবং মেটা-টিকটক অ্যাডস দিয়ে প্রতিদিন ৫০+ পার্সেল ডেলিভারি করার প্র্যাকটিক্যাল সিক্রেট ব্লুপ্রিন্ট।
              </p>
            </div>

            {/* Key Bullet Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                '২৪৮ পৃষ্ঠার তথ্যবহুল সম্পূর্ণ বাংলা গাইড',
                '৫০+ ভেরিফাইড পাইকারি সাপ্লায়ারের ডিরেক্টরি',
                '১০X ROAS মেটা ও টিকটক অ্যাডস ফর্মুলা',
                'রিটার্ন (RTO) ১৫% থেকে ৫% এ নামানোর কৌশল',
                'পেমেন্ট করলেই ইনস্ট্যান্ট অটোমেটিক আনলক',
                'অনলাইনে যেকোনো ডিভাইস থেকে পড়ার সুবিধা'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Limited Time Offer Card with Live Countdown */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>সীমিত সময়ের স্পেশাল অফার ({BOOK_DETAILS.discountPercentage}% ছাড়)</span>
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                      ৳{BOOK_DETAILS.offerPrice}
                    </span>
                    <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                      ৳{BOOK_DETAILS.regularPrice}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      ৳{BOOK_DETAILS.regularPrice - BOOK_DETAILS.offerPrice} সাশ্রয়
                    </span>
                  </div>
                </div>

                {/* Live Countdown Box */}
                <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 mb-1">অফার শেষ হতে বাকি:</p>
                  <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-black text-blue-400">
                    <span className="bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className="bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className="bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800 text-amber-400 animate-pulse">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onOpenCheckout}
                  className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>এখনই বইটি অর্ডার করুন (৳{BOOK_DETAILS.offerPrice})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={onOpenPreview}
                  className="py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>ফ্রি প্রিভিউ পড়ুন</span>
                </button>
              </div>

              {/* Instant Automated Payment Seals */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>অটোমেটিক পেমেন্ট সাপোর্ট:</span>
                  <span className="font-bold text-pink-400">বিকাশ</span> • 
                  <span className="font-bold text-orange-400">নগদ</span> • 
                  <span className="font-bold text-purple-400">রকেট</span> • 
                  <span className="font-bold text-emerald-400">উপায়</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>অটোমেটিক ইনস্ট্যান্ট অ্যাক্টিভেশন</span>
                </div>
              </div>
            </div>

            {/* Social Trust Stat Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span><strong className="text-white font-bold">{BOOK_DETAILS.copiesSold}+</strong> কপি বিক্রি হয়েছে</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>১০০% নিরাপদ সুরক্ষিত রিডার</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>লাইফটাইম এক্সেস গ্যারান্টি</span>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Book Cover Presentation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative">
              {/* Radial glow background */}
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-110 pointer-events-none" />
              
              {/* 3D Realistic Book Cover */}
              <BookCover size="lg" animate={true} />
            </div>

            {/* Quick Caption Under Book */}
            <div className="mt-8 text-center space-y-1">
              <p className="text-sm font-bold text-white">
                {BOOK_DETAILS.title} • {BOOK_DETAILS.totalPages} পৃষ্ঠা
              </p>
              <p className="text-xs text-slate-400">
                কম্পিউটার, ট্যাব বা যেকোনো স্মার্টফোন থেকে সরাসরি পড়তে পারবেন
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
