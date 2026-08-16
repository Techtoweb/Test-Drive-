import React, { useState } from 'react';
import { X, Search, Phone, Key, ShieldCheck, AlertCircle, ArrowRight, Clock, AlertTriangle, CheckCircle2, ExternalLink, Gift, Users } from 'lucide-react';
import { Order, CustomerSession } from '../types';
import { BOOK_DETAILS } from '../data/bookData';
import { bookCoverImg } from '../assets/images';

interface AccessLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted: (session: CustomerSession) => void;
  orders: Order[];
  onOpenCheckout?: () => void;
}

export const AccessLookupModal: React.FC<AccessLookupModalProps> = ({
  isOpen,
  onClose,
  onAccessGranted,
  orders,
  onOpenCheckout,
}) => {
  const [lookupQuery, setLookupQuery] = useState('');
  const [error, setError] = useState('');
  const [pendingNotice, setPendingNotice] = useState<{ orderNumber: string; trxId: string; phone: string } | null>(null);
  const [rejectedNotice, setRejectedNotice] = useState<{ orderNumber: string; trxId: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingNotice(null);
    setRejectedNotice(null);
    const query = lookupQuery.trim();

    if (!query) {
      setError('অনুগ্রহ করে আপনার অর্ডারকৃত মোবাইল নাম্বার অথবা এক্সেস কোড লিখুন।');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      // Find matching order in state or localStorage
      const cleanPhone = query.replace(/[^0-9]/g, '');
      
      // Look up order matching query
      const match = orders.find(
        (o) =>
          (cleanPhone.length >= 7 && o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone)) ||
          o.accessCode.toUpperCase() === query.toUpperCase() ||
          o.orderNumber.toUpperCase() === query.toUpperCase() ||
          o.trxId.toUpperCase() === query.toUpperCase()
      );

      setIsSearching(false);

      if (match) {
        // Customer found in orders
        const session: CustomerSession = {
          customerName: match.customerName || 'ভেরিফাইড পাঠক',
          customerPhone: match.customerPhone,
          customerEmail: match.customerEmail,
          accessCode: match.accessCode,
          orderId: match.orderNumber,
          purchasedAt: match.createdAt,
        };

        if (match.status === 'completed') {
          // Strictly only grant access if admin has approved
          onAccessGranted(session);
          onClose();
        } else if (match.status === 'pending') {
          // Locked until admin approves
          setPendingNotice({
            orderNumber: match.orderNumber,
            trxId: match.trxId,
            phone: match.customerPhone,
          });
        } else if (match.status === 'rejected') {
          setRejectedNotice({
            orderNumber: match.orderNumber,
            trxId: match.trxId,
          });
        }
      } else {
        setError('এই মোবাইল নাম্বার বা এক্সেস কোড দিয়ে কোনো অনুমোদিত অর্ডার পাওয়া যায়নি। আপনি যদি অর্ডার না করে থাকেন, তবে অনুগ্রহ করে নিচের বাটনে ক্লিক করে অর্ডার সম্পন্ন করুন।');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-['Hind_Siliguri',sans-serif]">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-white">আগের কেনা বই পড়ুন (অর্ডার যাচাই)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleLookup} className="p-5 sm:p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <img 
              src={bookCoverImg} 
              alt={BOOK_DETAILS.title} 
              className="w-10 h-14 object-cover rounded-md shadow-sm border border-slate-700 shrink-0" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/book_cover.jpg' && !target.src.endsWith('/book_cover.jpg')) {
                  target.src = '/book_cover.jpg';
                }
              }}
            />
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs text-white truncate font-['Outfit',sans-serif]">
                {BOOK_DETAILS.title}
              </h4>
              <p className="text-[11px] text-slate-400">লেখক: {BOOK_DETAILS.author}</p>
              <p className="text-[10px] text-blue-400 mt-0.5">DRM অনলাইন সুরক্ষিত ই-বুক রিডার</p>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            বইটি অর্ডার করার সময় আপনি যে মোবাইল নাম্বার বা TrxID দিয়েছিলেন, তা লিখে সাবমিট করুন:
          </p>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">মোবাইল নাম্বার / TrxID / এক্সেস কোড</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="উদাঃ 01711223344 বা TrxID"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Pending Notice */}
          {pendingNotice && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                <span>পেমেন্ট এখনও অনুমোদনের অপেক্ষায় রয়েছে!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                আপনার অর্ডার নং <strong className="text-white font-mono">{pendingNotice.orderNumber}</strong> (TrxID: <strong className="text-amber-300 font-mono">{pendingNotice.trxId}</strong>) অ্যাডমিনের পর্যালোচনায় রয়েছে।
              </p>
              <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                ⚠️ এডমিন আপনার পেমেন্ট যাচাই করে অনুমোদন (Approve) করার পর আপনি বইটি পড়তে পারবেন।
              </p>
            </div>
          )}

          {/* Rejected Notice */}
          {rejectedNotice && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>পেমেন্ট ভেরিফিকেশন বাতিল হয়েছে</span>
              </div>
              <p className="text-[11px] text-slate-300">
                আপনার অর্ডার নং <strong className="text-white font-mono">{rejectedNotice.orderNumber}</strong> এর পেমেন্ট তথ্য সঠিক পাওয়া যায়নি। সঠিক TrxID সহ পুনরায় চেষ্টা করুন।
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-75"
          >
            {isSearching ? (
              <span>যাচাই করা হচ্ছে...</span>
            ) : (
              <>
                <span>বই ওপেন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {onOpenCheckout && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline underline-offset-4"
              >
                এখনও বইটি কেনেননি? অর্ডার করুন ➔
              </button>
            </div>
          )}

          <div className="pt-1 text-center space-y-2.5">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>অনলাইন সুরক্ষিত DRM রিডার • ডাউনলোড ও পাইরেসি নিষিদ্ধ</span>
            </p>

            <a
              href="https://www.facebook.com/groups/4640838359521804"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>৪টি বোনাস ও সাপোর্টের জন্য ফেসবুক গ্রুপে যুক্ত হোন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
