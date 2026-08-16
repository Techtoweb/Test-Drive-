import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, BookOpen, Bookmark, ZoomIn, ZoomOut, 
  Sun, Moon, Coffee, Maximize, Minimize, ShieldCheck, ShieldAlert,
  List, CheckCircle, Award, Sparkles, HelpCircle, Lock, ExternalLink, 
  Gift, Users, FileText, ScrollText, Download, Eye, ArrowRight, ArrowLeft,
  Sliders, Layers, Search
} from 'lucide-react';
import { Chapter, CustomerSession } from '../types';
import { BOOK_DETAILS, CHAPTERS_DATA, BONUSES_DATA } from '../data/bookData';
import { PDF_PAGES_DATA, TOTAL_PDF_PAGES, PdfPage } from '../data/pdfPages';

export const CHAPTER_PAGE_OFFSETS: Record<number, number> = {
  0: 1,   // ভূমিকা (pages 1-7)
  1: 8,   // অধ্যায় ১ (pages 8-21)
  2: 22,  // অধ্যায় ২ (pages 22-39)
  3: 40,  // অধ্যায় ৩ (pages 40-61)
  4: 62,  // অধ্যায় ৪ (pages 62-88)
  5: 89,  // অধ্যায় ৫ (pages 89-111)
  6: 112, // অধ্যায় ৬ (pages 112-134)
  7: 135, // অধ্যায় ৭ (pages 135-163)
  8: 164, // অধ্যায় ৮ (pages 164-186)
  9: 187, // অধ্যায় ০৯ (pages 187-208)
  10: 209 // অধ্যায় ১০ (pages 209-246)
};

export const CHAPTER_PAGE_RANGES: { [key: number]: string } = {
  0: "১ - ৭",
  1: "৮ - ২১",
  2: "২২ - ৩৯",
  3: "৪০ - ৬১",
  4: "৬২ - ৮৮",
  5: "৮৯ - ১১১",
  6: "১১২ - ১৩৪",
  7: "১৩৫ - ১৬৩",
  8: "১৬৪ - ১৮৬",
  9: "১৮৭ - ২০৮",
  10: "২০৯ - ২৪৬"
};

const getChapterForPage = (pageNum: number): number => {
  const keys = Object.keys(CHAPTER_PAGE_OFFSETS).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (pageNum >= CHAPTER_PAGE_OFFSETS[k]) {
      return k;
    }
  }
  return 0;
};

interface DrmReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CustomerSession | null;
  customPdfDataUrl?: string | null;
}

export const DrmReaderModal: React.FC<DrmReaderModalProps> = ({
  isOpen,
  onClose,
  session,
  customPdfDataUrl,
}) => {
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(1);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [pdfDisplayMode, setPdfDisplayMode] = useState<'single' | 'scroll'>('single');
  const [pageInputVal, setPageInputVal] = useState<string>('1');
  const [theme, setTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const readerContainerRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Load saved progress & bookmarks
  useEffect(() => {
    if (session?.customerPhone) {
      const savedPdfPage = localStorage.getItem(`ecom360_pdf_page_${session.customerPhone}`);
      if (savedPdfPage) {
        const pNum = parseInt(savedPdfPage, 10);
        if (!isNaN(pNum) && pNum >= 1 && pNum <= TOTAL_PDF_PAGES) {
          setCurrentPdfPage(pNum);
          setPageInputVal(pNum.toString());
          setCurrentChapterIndex(getChapterForPage(pNum));
        }
      }
      const savedBookmarks = localStorage.getItem(`ecom360_pdf_bookmarks_${session.customerPhone}`);
      if (savedBookmarks) {
        try {
          setBookmarkedPages(JSON.parse(savedBookmarks));
        } catch {
          // ignore
        }
      }
    }
  }, [session]);

  // Sync page input
  useEffect(() => {
    setPageInputVal(currentPdfPage.toString());
    const matchedChap = getChapterForPage(currentPdfPage);
    setCurrentChapterIndex(matchedChap);
  }, [currentPdfPage]);

  // Handle Chapter selection from left sidebar -> direct jump to starting PDF page
  const handleSelectChapter = (chapterIdx: number) => {
    const targetPage = CHAPTER_PAGE_OFFSETS[chapterIdx] || 1;
    setCurrentPdfPage(targetPage);
    setCurrentChapterIndex(chapterIdx);
    setPageInputVal(targetPage.toString());

    if (session?.customerPhone) {
      localStorage.setItem(`ecom360_pdf_page_${session.customerPhone}`, targetPage.toString());
      localStorage.setItem(`ecom360_page_${session.customerPhone}`, chapterIdx.toString());
    }

    if (pdfDisplayMode === 'scroll') {
      setTimeout(() => {
        const el = document.getElementById(`pdf-page-${targetPage}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } else {
      if (contentAreaRef.current) {
        contentAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Handle page changes
  const handlePageChange = (newPageNum: number) => {
    const clamped = Math.max(1, Math.min(newPageNum, TOTAL_PDF_PAGES));
    setCurrentPdfPage(clamped);
    const matchedChap = getChapterForPage(clamped);
    setCurrentChapterIndex(matchedChap);

    if (session?.customerPhone) {
      localStorage.setItem(`ecom360_pdf_page_${session.customerPhone}`, clamped.toString());
      localStorage.setItem(`ecom360_page_${session.customerPhone}`, matchedChap.toString());
    }

    if (pdfDisplayMode === 'scroll') {
      const el = document.getElementById(`pdf-page-${clamped}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      if (contentAreaRef.current) {
        contentAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInputVal, 10);
    if (!isNaN(p) && p >= 1 && p <= TOTAL_PDF_PAGES) {
      handlePageChange(p);
    } else {
      setPageInputVal(currentPdfPage.toString());
    }
  };

  const toggleBookmarkCurrentPage = () => {
    let updated: number[];
    if (bookmarkedPages.includes(currentPdfPage)) {
      updated = bookmarkedPages.filter(p => p !== currentPdfPage);
    } else {
      updated = [...bookmarkedPages, currentPdfPage];
    }
    setBookmarkedPages(updated);
    if (session?.customerPhone) {
      localStorage.setItem(`ecom360_pdf_bookmarks_${session.customerPhone}`, JSON.stringify(updated));
    }
  };

  // DRM & Security Interceptors
  useEffect(() => {
    if (!isOpen) return;

    const triggerWarning = (msg: string) => {
      setWarningMessage(msg);
      setShowSecurityWarning(true);
      setTimeout(() => setShowSecurityWarning(false), 3500);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning('কপিরাইট সুরক্ষিত: টেক্সট কপি করা বা রাইট-ক্লিক সম্পূর্ণ নিষিদ্ধ।');
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Print, Save, Source, DevTools, Copy
      if (
        (e.ctrlKey || e.metaKey) && 
        ['s', 'p', 'u', 'c', 'a', 'x'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        triggerWarning('নিরাপত্তা সতর্কতা: সম্পূর্ণ বইটি শুধুমাত্র অনলাইনে পড়ার জন্য DRM সুরক্ষিত।');
        return false;
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        triggerWarning('ডেভেলপার টুল অ্যাক্সেস ব্লক করা হয়েছে।');
        return false;
      }
      if (e.key === 'PrintScreen') {
        triggerWarning('স্ক্রিনশট প্রটেকশন অ্যাক্টিভ: ডিজিটাল ওয়াটারমার্কে আপনার লাইসেন্স নাম্বার দৃশ্যমান।');
      }

      // Keyboard arrow navigation
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          handlePageChange(currentPdfPage + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          handlePageChange(currentPdfPage - 1);
        }
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentPdfPage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  const activePageData = PDF_PAGES_DATA.find(p => p.pageNumber === currentPdfPage) || PDF_PAGES_DATA[0];
  const progressPercent = Math.round((currentPdfPage / TOTAL_PDF_PAGES) * 100);

  const themeStyles = {
    dark: {
      bg: 'bg-[#0f172a] text-slate-100',
      paperBg: 'bg-white text-slate-900 shadow-2xl border-slate-700/50',
      headerBg: 'bg-[#0b1120]/95 border-slate-800 text-slate-100',
      sidebarBg: 'bg-[#090d16] border-slate-800/80 text-slate-300',
      bottomBarBg: 'bg-[#0b1120]/95 border-slate-800 text-slate-200',
      watermarkColor: 'text-slate-400/15',
    },
    light: {
      bg: 'bg-slate-200 text-slate-900',
      paperBg: 'bg-white text-slate-900 shadow-xl border-slate-300',
      headerBg: 'bg-white/95 border-slate-300 text-slate-900',
      sidebarBg: 'bg-slate-50 border-slate-200 text-slate-800',
      bottomBarBg: 'bg-white/95 border-slate-300 text-slate-900',
      watermarkColor: 'text-slate-900/10',
    },
    sepia: {
      bg: 'bg-[#e8dec7] text-[#433422]',
      paperBg: 'bg-[#fbf7ee] text-[#2c2217] shadow-xl border-[#d8c59f]',
      headerBg: 'bg-[#dfd3b8]/95 border-[#cbbe9f] text-[#433422]',
      sidebarBg: 'bg-[#e5d9bd] border-[#cbbe9f] text-[#433422]',
      bottomBarBg: 'bg-[#dfd3b8]/95 border-[#cbbe9f] text-[#433422]',
      watermarkColor: 'text-[#5a4224]/12',
    }
  }[theme];

  const watermarkText = session 
    ? `${session.customerName || 'ভেরিফাইড ক্রেতা'} • ${session.customerPhone} • LICENSE: ${session.accessCode || 'AUTH-DRM'} • NO PRINT/COPY`
    : `OFFICIAL E-COMMERCE 360° READER • ${BOOK_DETAILS.author} • ALL RIGHTS RESERVED`;

  const filteredChapters = CHAPTERS_DATA.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to render page diagrams/infographics when available
  const renderPageDiagram = (pageNum: number) => {
    switch (pageNum) {
      case 10:
        return (
          <div className="my-6 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-3 shadow-inner">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
              INFOGRAPHIC: ONLINE SHOPPING CONCEPTS
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                <span className="text-xl block mb-1">🛒</span>
                <span>Checkout & EDI</span>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                <span className="text-xl block mb-1">💳</span>
                <span>Secure Payment</span>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                <span className="text-xl block mb-1">📦</span>
                <span>Global Logistics</span>
              </div>
            </div>
          </div>
        );
      case 15:
        return (
          <div className="my-6 p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-3 text-center">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest font-mono">
              Supply Chain Network Diagram
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-800">
              <span className="px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-lg">🏭 Sub Suppliers</span>
              <span className="text-blue-500 font-bold">➔</span>
              <span className="px-3 py-1.5 bg-indigo-100 border border-indigo-200 rounded-lg">🏢 Distribution Center</span>
              <span className="text-blue-500 font-bold">➔</span>
              <span className="px-3 py-1.5 bg-emerald-100 border border-emerald-200 rounded-lg">🚚 Last-Mile Shipping</span>
              <span className="text-blue-500 font-bold">➔</span>
              <span className="px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-lg">👤 Customer</span>
            </div>
          </div>
        );
      case 21:
        return (
          <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-300/40 text-center">
            <h5 className="font-extrabold text-xs sm:text-sm text-blue-700 uppercase tracking-wider mb-2">
              ONLINE SHOPPING vs IN-STORE SHOPPING
            </h5>
            <p className="text-xs text-slate-700 leading-relaxed">
              সিল্ক রোডের উটের কাফেলা থেকে শুরু করে আজকের 1-Click Amazon ড্রোন ডেলিভারি পর্যন্ত—গ্রাহকের কাছে তাৎক্ষণিক ভ্যালু পৌঁছে দেওয়াই আসল বিপ্লব।
            </p>
          </div>
        );
      case 23:
        return (
          <div className="my-5 p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-2">
            <h5 className="text-xs font-bold text-blue-600 text-center uppercase tracking-wider font-mono">
              Consumer Decision Making Process
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center text-[11px] font-semibold text-slate-700">
              <div className="p-2 bg-white rounded-lg border border-slate-200">1. Need Recognition</div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">2. Info Search</div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">3. Evaluate Options</div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">4. Purchase Decision</div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">5. Post Purchase</div>
            </div>
          </div>
        );
      case 31:
        return (
          <div className="my-5 p-4 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-md">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2 mb-2">
              <span className="font-bold text-amber-400">⏱️ Smart Cart Countdown Timer</span>
              <span className="font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">14:39 Left</span>
            </div>
            <p className="text-[11px] text-slate-300">
              সাইকোলজিক্যাল আরজেন্সি এবং FOMO ব্যবহার করে কনভার্সন রেট ৩০% পর্যন্ত বৃদ্ধি করা সম্ভব।
            </p>
          </div>
        );
      case 34:
        return (
          <div className="my-4 p-3 rounded-xl bg-slate-100 border border-slate-300 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">🔒 Guaranteed SAFE & Secure Checkout</span>
            <div className="flex justify-center items-center gap-3 text-xs font-bold text-slate-800 pt-1">
              <span className="px-2 py-1 bg-white rounded shadow-sm border">VISA</span>
              <span className="px-2 py-1 bg-white rounded shadow-sm border">Mastercard</span>
              <span className="px-2 py-1 bg-white rounded shadow-sm border">Stripe</span>
              <span className="px-2 py-1 bg-white rounded shadow-sm border">bKash</span>
            </div>
          </div>
        );
      case 64:
        return (
          <div className="my-5 p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2 text-center">
            <span className="text-xs font-bold text-blue-700 font-mono uppercase">The Dropshipping Cash-Flow Cycle</span>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-800 flex-wrap">
              <span className="px-3 py-1 bg-white rounded border">Customer Pays ($50)</span>
              <span>➔</span>
              <span className="px-3 py-1 bg-emerald-100 rounded border border-emerald-300 text-emerald-800">Your Profit ($20)</span>
              <span>➔</span>
              <span className="px-3 py-1 bg-white rounded border">Supplier Shipped ($30)</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={readerContainerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles.bg} no-select overflow-hidden font-['Hind_Siliguri',sans-serif]`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Header Controls Bar */}
      <header className={`h-16 px-3 sm:px-5 flex items-center justify-between border-b backdrop-blur-md z-30 shrink-0 ${themeStyles.headerBg}`}>
        {/* Left: Sidebar Toggle & Book Title */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
            title="বইয়ের সূচিপত্র ও অধ্যায়সমূহ"
          >
            <List className="w-4 h-4" />
            <span>সূচিপত্র</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-500/30 hidden md:block"></div>

          <div className="hidden sm:block min-w-0">
            <h3 className="font-extrabold text-xs sm:text-sm truncate max-w-xs md:max-w-md font-['Outfit',sans-serif]">
              {BOOK_DETAILS.title}
            </h3>
            <p className="text-[10px] opacity-75 flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 inline" />
              <span>লাইসেন্স ভেরিফাইড: {session?.customerPhone || 'সক্রিয় পাঠক'}</span>
            </p>
          </div>
        </div>

        {/* Center: PDF Page Jump & Page Flip Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Previous Page */}
          <button
            disabled={currentPdfPage <= 1}
            onClick={() => handlePageChange(currentPdfPage - 1)}
            className="p-1.5 sm:p-2 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="পূর্ববর্তী পৃষ্ঠা (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Input Box */}
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <span className="text-xs font-semibold hidden sm:inline opacity-75">পৃষ্ঠা</span>
            <input 
              type="text" 
              value={pageInputVal}
              onChange={(e) => setPageInputVal(e.target.value)}
              onBlur={() => handlePageInputSubmit({ preventDefault: () => {} } as any)}
              className="w-12 sm:w-14 text-center font-mono font-bold text-xs sm:text-sm py-1 px-1 rounded-lg bg-black/15 dark:bg-white/10 border border-slate-500/40 focus:outline-none focus:border-blue-500"
              title="পৃষ্ঠা নাম্বার লিখে Enter চাপুন"
            />
            <span className="text-xs font-mono opacity-75">/ {TOTAL_PDF_PAGES}</span>
          </form>

          {/* Next Page */}
          <button
            disabled={currentPdfPage >= TOTAL_PDF_PAGES}
            onClick={() => handlePageChange(currentPdfPage + 1)}
            className="p-1.5 sm:p-2 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="পরবর্তী পৃষ্ঠা (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Display Mode Toggle */}
          <div className="hidden lg:flex items-center bg-black/10 dark:bg-white/10 p-0.5 rounded-lg ml-2">
            <button
              onClick={() => setPdfDisplayMode('single')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                pdfDisplayMode === 'single' ? 'bg-blue-600 text-white font-bold' : 'opacity-70 hover:opacity-100'
              }`}
              title="একক পৃষ্ঠা ভিউ"
            >
              একক পৃষ্ঠা
            </button>
            <button
              onClick={() => setPdfDisplayMode('scroll')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                pdfDisplayMode === 'scroll' ? 'bg-blue-600 text-white font-bold' : 'opacity-70 hover:opacity-100'
              }`}
              title="একটানা স্ক্রোল ভিউ"
            >
              একটানা স্ক্রোল
            </button>
          </div>
        </div>

        {/* Right: Theme, Zoom, Fullscreen & Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bookmark Button */}
          <button
            onClick={toggleBookmarkCurrentPage}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              bookmarkedPages.includes(currentPdfPage)
                ? 'text-amber-400 bg-amber-400/10'
                : 'opacity-70 hover:opacity-100 hover:text-amber-400'
            }`}
            title="এই পৃষ্ঠাটি বুকমার্ক করুন"
          >
            <Bookmark className={`w-4 h-4 ${bookmarkedPages.includes(currentPdfPage) ? 'fill-current' : ''}`} />
          </button>

          {/* Theme Switcher */}
          <div className="hidden sm:flex items-center bg-black/10 dark:bg-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded ${theme === 'dark' ? 'bg-blue-600 text-white' : 'opacity-70 hover:opacity-100'}`}
              title="নাইট মোড"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded ${theme === 'light' ? 'bg-blue-600 text-white' : 'opacity-70 hover:opacity-100'}`}
              title="ডে মোড"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded ${theme === 'sepia' ? 'bg-amber-700 text-white' : 'opacity-70 hover:opacity-100'}`}
              title="সেপিয়া পেপার মোড"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom */}
          <div className="hidden xl:flex items-center bg-black/10 dark:bg-white/10 rounded-lg px-2 py-1 gap-1 text-xs font-mono">
            <button 
              onClick={() => setZoomScale(Math.max(80, zoomScale - 10))}
              className="hover:text-blue-400 font-bold p-0.5"
              title="জুম আউট"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span>{zoomScale}%</span>
            <button 
              onClick={() => setZoomScale(Math.min(150, zoomScale + 10))}
              className="hover:text-blue-400 font-bold p-0.5"
              title="জুম ইন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-white transition-colors hidden md:block cursor-pointer"
            title="ফুলস্ক্রিন মোড"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="রিডার বন্ধ করুন"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">বন্ধ</span>
          </button>
        </div>
      </header>

      {/* Main Body Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Table of Contents (Chapter list with direct page jump) */}
        <aside 
          className={`absolute lg:relative z-40 top-0 bottom-0 left-0 w-80 max-w-[85vw] ${themeStyles.sidebarBg} border-r shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm flex items-center gap-2 text-blue-400">
                <BookOpen className="w-4 h-4" />
                <span>বইয়ের সূচিপত্র ({CHAPTERS_DATA.length} অধ্যায়)</span>
              </h4>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
              <input 
                type="text" 
                placeholder="অধ্যায় সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-black/15 dark:bg-white/5 border border-slate-700/60 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Reading Progress Indicator */}
          <div className="px-4 py-2.5 bg-blue-500/10 border-b text-xs flex items-center justify-between">
            <span className="font-medium text-slate-300">পড়ার অগ্রগতি:</span>
            <span className="font-mono font-bold text-blue-400">{progressPercent}% (পৃষ্ঠা {currentPdfPage}/{TOTAL_PDF_PAGES})</span>
          </div>

          {/* Chapter List with Direct Start Page Click */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredChapters.map((chapter) => {
              const originalIndex = CHAPTERS_DATA.findIndex(c => c.id === chapter.id);
              const startPage = CHAPTER_PAGE_OFFSETS[originalIndex] || 1;
              const pageRange = CHAPTER_PAGE_RANGES[originalIndex] || "";
              const isActive = currentChapterIndex === originalIndex;

              return (
                <button
                  key={chapter.id}
                  onClick={() => handleSelectChapter(originalIndex)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer border ${
                    isActive 
                      ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-md scale-[1.01]' 
                      : 'border-transparent hover:bg-black/10 dark:hover:bg-white/5 opacity-85'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-extrabold mt-0.5 ${
                    isActive ? 'bg-white text-blue-600' : 'bg-slate-800 text-blue-400 border border-slate-700'
                  }`}>
                    {chapter.id === 0 ? 'ভূ' : chapter.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-xs leading-snug">{chapter.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        পৃষ্ঠা: {pageRange}
                      </span>
                    </div>
                  </div>
                  {bookmarkedPages.includes(startPage) && (
                    <Bookmark className={`w-3.5 h-3.5 shrink-0 fill-current ${isActive ? 'text-white' : 'text-amber-400'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Support Link */}
          <div className="p-3 border-t bg-gradient-to-br from-blue-950/60 to-slate-900/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Gift className="w-3.5 h-3.5" />
              <span>৪টি বোনাস ফাইল ও সাপোর্ট</span>
            </div>
            <a
              href="https://www.facebook.com/groups/4640838359521804"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>ভিআইপি ফেসবুক গ্রুপ</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </aside>

        {/* PDF Book Content Canvas */}
        <main 
          ref={contentAreaRef}
          className="flex-1 overflow-y-auto relative p-3 sm:p-6 md:p-8 flex flex-col items-center"
        >
          {/* Dynamic Diagonal Anti-Piracy Watermark Matrix */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex flex-col justify-around opacity-30 select-none">
            {Array.from({ length: 8 }).map((_, r) => (
              <div 
                key={r} 
                className="flex justify-around transform -rotate-25 whitespace-nowrap"
              >
                {Array.from({ length: 3 }).map((_, c) => (
                  <span 
                    key={c} 
                    className={`text-[11px] font-mono tracking-widest font-bold ${themeStyles.watermarkColor} px-8`}
                  >
                    {watermarkText}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* SINGLE PAGE VIEW (AUTHENTIC A4 PAGE SHEET) */}
          {pdfDisplayMode === 'single' && (
            <div 
              className="w-full flex flex-col items-center justify-start max-w-4xl py-2 relative z-10 transition-transform duration-200"
              style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: 'top center' }}
            >
              <article 
                className={`w-full max-w-3xl ${themeStyles.paperBg} rounded-sm sm:rounded-md p-6 sm:p-12 md:p-16 min-h-[950px] flex flex-col justify-between relative shadow-2xl`}
              >
                {/* PDF Page Header (Top Line with Page Number at top right) */}
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 text-slate-600 text-xs font-['Hind_Siliguri',sans-serif]">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                      {activePageData.chapterTitle}
                    </span>
                    <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {activePageData.pageNumber}
                    </span>
                  </div>

                  {/* Render Page Content */}
                  <div className="space-y-4 text-slate-800 leading-relaxed text-justify text-sm sm:text-base">
                    {/* Diagram or Infographic if present */}
                    {renderPageDiagram(activePageData.pageNumber)}

                    {/* Text Parsing */}
                    {activePageData.content.split('\n\n').map((para, idx) => {
                      const trimmed = para.trim();
                      if (trimmed.startsWith('# ')) {
                        return (
                          <h1 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-6 mb-4 text-left border-b-2 border-blue-600 pb-2">
                            {trimmed.replace('# ', '')}
                          </h1>
                        );
                      }
                      if (trimmed.startsWith('## ')) {
                        return (
                          <h2 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 mt-5 mb-2 text-left">
                            {trimmed.replace('## ', '')}
                          </h2>
                        );
                      }
                      if (trimmed.startsWith('### ')) {
                        return (
                          <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-1 text-left">
                            {trimmed.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (trimmed.startsWith('● ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                        const lines = trimmed.split('\n');
                        return (
                          <ul key={idx} className="space-y-1.5 my-3 pl-4 list-disc text-slate-800">
                            {lines.map((l, liIdx) => (
                              <li key={liIdx} className="leading-relaxed">
                                {l.replace(/^[●•-]\s*/, '')}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (trimmed.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="p-4 my-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-slate-900 font-medium italic text-sm">
                            {trimmed.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return (
                        <p key={idx} className="leading-relaxed text-slate-850">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* PDF Page Bottom Footer */}
                <div className="pt-6 mt-8 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>E-Commerce 360° • A to Z Blueprint</span>
                  <span>পৃষ্ঠা {activePageData.pageNumber} / {TOTAL_PDF_PAGES}</span>
                </div>
              </article>

              {/* Bottom Quick Page Turner Controls */}
              <div className="w-full max-w-3xl mt-4 flex items-center justify-between gap-3 text-xs font-semibold">
                <button
                  disabled={currentPdfPage <= 1}
                  onClick={() => handlePageChange(currentPdfPage - 1)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>আগের পৃষ্ঠা</span>
                </button>

                <div className="flex items-center gap-2 font-mono text-slate-300">
                  <span>পৃষ্ঠা {currentPdfPage} / {TOTAL_PDF_PAGES}</span>
                </div>

                <button
                  disabled={currentPdfPage >= TOTAL_PDF_PAGES}
                  onClick={() => handlePageChange(currentPdfPage + 1)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>পরের পৃষ্ঠা</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CONTINUOUS SCROLL VIEW (ALL PAGES SEQUENTIALLY) */}
          {pdfDisplayMode === 'scroll' && (
            <div 
              className="w-full flex flex-col items-center justify-start max-w-4xl py-4 space-y-8 relative z-10"
              style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: 'top center' }}
            >
              {PDF_PAGES_DATA.map((page) => (
                <article 
                  key={page.pageNumber}
                  id={`pdf-page-${page.pageNumber}`}
                  className={`w-full max-w-3xl ${themeStyles.paperBg} rounded-sm sm:rounded-md p-6 sm:p-12 md:p-16 min-h-[950px] flex flex-col justify-between relative shadow-xl`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 text-slate-600 text-xs">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                        {page.chapterTitle}
                      </span>
                      <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {page.pageNumber}
                      </span>
                    </div>

                    <div className="space-y-4 text-slate-800 leading-relaxed text-justify text-sm sm:text-base">
                      {renderPageDiagram(page.pageNumber)}
                      {page.content.split('\n\n').map((para, idx) => {
                        const trimmed = para.trim();
                        if (trimmed.startsWith('# ')) {
                          return (
                            <h1 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-6 mb-4 text-left border-b-2 border-blue-600 pb-2">
                              {trimmed.replace('# ', '')}
                            </h1>
                          );
                        }
                        if (trimmed.startsWith('## ')) {
                          return (
                            <h2 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 mt-5 mb-2 text-left">
                              {trimmed.replace('## ', '')}
                            </h2>
                          );
                        }
                        if (trimmed.startsWith('### ')) {
                          return (
                            <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-1 text-left">
                              {trimmed.replace('### ', '')}
                            </h3>
                          );
                        }
                        if (trimmed.startsWith('● ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                          const lines = trimmed.split('\n');
                          return (
                            <ul key={idx} className="space-y-1.5 my-3 pl-4 list-disc text-slate-800">
                              {lines.map((l, liIdx) => (
                                <li key={liIdx} className="leading-relaxed">
                                  {l.replace(/^[●•-]\s*/, '')}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        if (trimmed.startsWith('> ')) {
                          return (
                            <blockquote key={idx} className="p-4 my-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-slate-900 font-medium italic text-sm">
                              {trimmed.replace('> ', '')}
                            </blockquote>
                          );
                        }
                        return (
                          <p key={idx} className="leading-relaxed text-slate-850">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 mt-8 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>E-Commerce 360° • A to Z Blueprint</span>
                    <span>পৃষ্ঠা {page.pageNumber} / {TOTAL_PDF_PAGES}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Bottom Floating Page Slider Toolbar */}
      <footer className={`h-12 px-4 flex items-center justify-between border-t z-30 shrink-0 ${themeStyles.bottomBarBg}`}>
        <div className="flex items-center gap-3 w-full max-w-xl mx-auto">
          <span className="text-[11px] font-mono opacity-75 shrink-0">পৃষ্ঠা ১</span>
          <input 
            type="range" 
            min="1" 
            max={TOTAL_PDF_PAGES} 
            value={currentPdfPage}
            onChange={(e) => handlePageChange(parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 h-1.5 bg-slate-700/40 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono opacity-75 shrink-0">পৃষ্ঠা ২৪৬</span>
        </div>
      </footer>

      {/* Floating DRM Warning Alert */}
      {showSecurityWarning && (
        <div className="fixed bottom-16 right-6 z-50 max-w-sm bg-rose-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 border border-rose-400 animate-bounce">
          <ShieldAlert className="w-6 h-6 shrink-0 text-white" />
          <div className="text-xs">
            <p className="font-bold">ডিজিটাল কপিরাইট সুরক্ষা সক্রিয়</p>
            <p className="mt-0.5 opacity-90">{warningMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
