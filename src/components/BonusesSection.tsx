import React from 'react';
import { Gift, PackageCheck, Megaphone, Calculator, Users, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { BONUSES_DATA, BOOK_DETAILS } from '../data/bookData';

interface BonusesSectionProps {
  onOpenCheckout: () => void;
}

export const BonusesSection: React.FC<BonusesSectionProps> = ({ onOpenCheckout }) => {
  const totalBonusValue = BONUSES_DATA.reduce((acc, b) => acc + b.value, 0);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'PackageCheck': return <PackageCheck className="w-6 h-6 text-blue-400" />;
      case 'Megaphone': return <Megaphone className="w-6 h-6 text-amber-400" />;
      case 'Calculator': return <Calculator className="w-6 h-6 text-emerald-400" />;
      case 'Users': return <Users className="w-6 h-6 text-purple-400" />;
      default: return <Gift className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden font-['Hind_Siliguri',sans-serif]">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            <span>ফ্রি এক্সক্লুসিভ বোনাস প্যাকেজ</span>
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            আজকে অর্ডার করলেই পাবেন <span className="text-amber-400">৳{totalBonusValue} মূল্যের</span> ৪টি স্পেশাল বোনাস একদম ফ্রি!
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            বইটি পড়ার পাশাপাশি আপনার ই-কমার্স বিজনেস দ্রুত শুরু ও স্কেল করার জন্য প্রয়োজনীয় সমস্ত রিসোর্স ও ডেটাবেজ আমরা ফ্রি উপহার হিসেবে অন্তর্ভুক্ত করেছি।
          </p>
        </div>

        {/* Bonus Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {BONUSES_DATA.map((bonus, idx) => (
            <div 
              key={bonus.id}
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500/50 shadow-xl transition-all space-y-4 relative group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getIcon(bonus.icon)}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {bonus.badge}
                  </span>
                  <p className="text-xs text-slate-400 mt-1 line-through font-mono">
                    মূল্য ৳{bonus.value}
                  </p>
                  <p className="text-xs font-extrabold text-emerald-400">
                    আজকে ফ্রি!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-blue-400 transition-colors">
                  বোনাস #{idx + 1}: {bonus.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  {bonus.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total Value Callout */}
        <div className="mt-12 max-w-2xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-950 border border-blue-500/40 text-center space-y-4 shadow-2xl">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">
            বইয়ের মূল্য (৳{BOOK_DETAILS.regularPrice}) + ৪টি বোনাস (৳{totalBonusValue}) = মোট ৳{BOOK_DETAILS.regularPrice + totalBonusValue}
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            সবকিছু একসাথে পাচ্ছেন মাত্র <span className="text-emerald-400 font-mono">৳{BOOK_DETAILS.offerPrice}</span> টাকায়!
          </h3>
          
          <div className="pt-2">
            <button
              onClick={onOpenCheckout}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>বোনাস সহ এখনই অর্ডার করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>অর্ডার করার পর আমাদের <a href="https://www.facebook.com/groups/4640838359521804" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold inline-flex items-center gap-0.5">ভিআইপি ফেসবুক গ্রুপে <ExternalLink className="w-3 h-3" /></a> যুক্ত হয়ে ৪টি বোনাস ও লাইভ সাপোর্ট পাবেন।</span>
          </p>
        </div>

      </div>
    </section>
  );
};
