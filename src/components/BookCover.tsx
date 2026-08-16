import React from 'react';
import { bookCoverImg } from '../assets/images';

interface BookCoverProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({ size = 'md', className = '', animate = true }) => {
  const sizeClasses = {
    sm: 'w-[180px] h-[270px]',
    md: 'w-[280px] sm:w-[320px] h-[420px] sm:h-[480px]',
    lg: 'w-[320px] sm:w-[380px] md:w-[420px] h-[480px] sm:h-[570px] md:h-[630px]',
  }[size];

  return (
    <div className={`relative group perspective-1000 select-none ${className}`}>
      {/* 3D Book Container */}
      <div 
        className={`relative ${sizeClasses} rounded-r-xl transition-transform duration-700 ease-out preserve-3d shadow-2xl shadow-blue-500/25 ${
          animate ? 'group-hover:rotate-y-12 rotate-y-6' : ''
        }`}
        style={{
          transform: 'rotateY(-12deg) rotateX(4deg)',
        }}
      >
        {/* Book Spine Simulation */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[18px] sm:w-[24px] bg-gradient-to-r from-slate-900 via-slate-700 to-slate-200 z-20 rounded-l-sm"
          style={{
            transform: 'translateX(-100%) rotateY(-90deg)',
            transformOrigin: 'right',
          }}
        />

        {/* Page Edges Thickness Layer */}
        <div 
          className="absolute right-0 top-[3px] bottom-[3px] w-[14px] sm:w-[18px] bg-gradient-to-r from-amber-100 via-slate-100 to-slate-200 z-0 rounded-r-sm shadow-inner"
          style={{
            transform: 'translateX(100%) rotateY(90deg)',
            transformOrigin: 'left',
          }}
        />

        {/* Front Cover Body using the Book Cover Image */}
        <div className="relative w-full h-full bg-white text-slate-900 rounded-r-xl overflow-hidden border border-slate-200/80 shadow-2xl flex flex-col justify-between">
          <img 
            src={bookCoverImg} 
            alt="The Complete Guide to E-Commerce 360 - S. M. Raihan" 
            className="w-full h-full object-cover rounded-r-xl"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== '/book_cover.jpg' && !target.src.endsWith('/book_cover.jpg')) {
                target.src = '/book_cover.jpg';
              }
            }}
          />

          {/* Subtle Paper Texture & Lighting Gloss */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.06] via-transparent to-white/30 pointer-events-none z-10" />
          <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none z-10" />
        </div>

        {/* Glow & Floating Badge */}
        <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xl border border-amber-300/40 flex items-center gap-1.5 z-30">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>বেস্ট সেলার ই-বুক</span>
        </div>
      </div>
    </div>
  );
};

