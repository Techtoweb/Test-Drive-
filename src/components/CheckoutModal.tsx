import React, { useState } from 'react';
import { 
  X, Check, Copy, ArrowRight, ShieldCheck, Zap, AlertCircle, 
  Sparkles, Lock, Phone, Mail, User, Tag, CheckCircle2, RefreshCw,
  Clock, AlertTriangle, ChevronRight, ExternalLink, Gift, Users
} from 'lucide-react';
import { PaymentGateway, PaymentConfig, Order, Coupon, CustomerSession, UserProfile } from '../types';
import { BOOK_DETAILS, DEFAULT_PAYMENT_CONFIGS, INITIAL_COUPONS } from '../data/bookData';
import { saveOrderToFirestore } from '../lib/firebase';
import { bookCoverImg } from '../assets/images';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order, session: CustomerSession) => void;
  onOpenReaderDirectly?: (session: CustomerSession) => void;
  paymentConfigs?: PaymentConfig[];
  coupons?: Coupon[];
  allOrders?: Order[];
  currentUser?: UserProfile | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenReaderDirectly,
  paymentConfigs = DEFAULT_PAYMENT_CONFIGS,
  coupons = INITIAL_COUPONS,
  allOrders = [],
  currentUser = null,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('bkash');
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phoneNumber || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [trxId, setTrxId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const currentConfig = paymentConfigs.find(p => p.gateway === selectedGateway) || paymentConfigs[0];
  
  // Calculate final pricing
  const basePrice = BOOK_DETAILS.offerPrice;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive);
    if (found) {
      setAppliedCoupon(found);
      setCouponError('');
    } else {
      setCouponError('দুঃখিত, কুপন কোডটি সঠিক নয় বা মেয়াদোত্তীর্ণ।');
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const validateInputs = () => {
    setFormError('');
    if (!customerName.trim()) {
      setFormError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@') || !customerEmail.includes('.')) {
      setFormError('অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন (যেমন: yourname@gmail.com)।');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 11) {
      setFormError('অনুগ্রহ করে যে নাম্বার থেকে টাকা পাঠিয়েছেন সেই সঠিক ১১ ডিজিটের মোবাইল নাম্বারটি লিখুন।');
      return false;
    }
    if (!trxId.trim() || trxId.trim().length < 6) {
      setFormError('অনুগ্রহ করে সেন্ড মানি করার পর প্রাপ্ত ফিরতি মেসেজের Transaction ID (TrxID) টি লিখুন।');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const accessCode = `EC360-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      gateway: selectedGateway,
      trxId: trxId.trim().toUpperCase(),
      amount: finalPrice,
      discount: discountAmount,
      couponCode: appliedCoupon?.code || '',
      createdAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', ' + new Date().toLocaleDateString('bn-BD'),
      status: 'pending', // Pending admin verification
      accessCode: accessCode,
      isAutoVerified: false,
      notes: 'পেমেন্ট যাচাইয়ের অপেক্ষায় আছে',
    };

    const newSession: CustomerSession = {
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerEmail: newOrder.customerEmail,
      accessCode: newOrder.accessCode,
      orderId: newOrder.orderNumber,
      purchasedAt: newOrder.createdAt,
    };

    // Save to Firebase Firestore
    try {
      await saveOrderToFirestore(newOrder);
    } catch (err) {
      console.warn('Firebase Firestore save notice (offline fallback active):', err);
    }

    setIsSubmitting(false);
    setSubmittedOrder(newOrder);
    onOrderSuccess(newOrder, newSession);
  };

  // Check live status of the submitted order from localStorage/state
  const checkLiveOrderStatus = () => {
    if (!submittedOrder) return;
    setIsCheckingStatus(true);
    setStatusMessage('');

    setTimeout(() => {
      try {
        const saved = localStorage.getItem('ecom360_orders');
        const ordersList: Order[] = saved ? JSON.parse(saved) : allOrders;
        const current = ordersList.find(o => o.id === submittedOrder.id || o.orderNumber === submittedOrder.orderNumber);

        if (current) {
          setSubmittedOrder(current);
          if (current.status === 'completed') {
            setStatusMessage('অভিনন্দন! এডমিন আপনার পেমেন্ট যাচাই করে অর্ডারটি অনুমোদন (Approve) করেছেন।');
          } else if (current.status === 'rejected') {
            setStatusMessage('দুঃখিত, আপনার পেমেন্ট রিকোয়েস্টটি বাতিল করা হয়েছে। সঠিক তথ্যের জন্য যোগাযোগ করুন।');
          } else {
            setStatusMessage('অর্ডারটি এখনও অ্যাডমিনের পর্যালোচনায় (Pending) রয়েছে। পেমেন্ট চেক হওয়ার সাথে সাথেই অ্যাপ্রুভ হয়ে যাবে।');
          }
        }
      } catch {
        // ignore
      }
      setIsCheckingStatus(false);
    }, 600);
  };

  const handleStartReading = () => {
    if (!submittedOrder) return;
    const session: CustomerSession = {
      customerName: submittedOrder.customerName,
      customerPhone: submittedOrder.customerPhone,
      customerEmail: submittedOrder.customerEmail,
      accessCode: submittedOrder.accessCode,
      orderId: submittedOrder.orderNumber,
      purchasedAt: submittedOrder.createdAt,
    };
    onClose();
    if (onOpenReaderDirectly) {
      onOpenReaderDirectly(session);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-['Hind_Siliguri',sans-serif]">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                ই-কমার্স ৩৬০° অর্ডার ও পেমেন্ট
              </h3>
              <p className="text-xs text-slate-400">
                {BOOK_DETAILS.title} • {BOOK_DETAILS.author}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {submittedOrder ? (
          /* Order Submitted Status View (Pending / Approved) */
          <div className="p-5 sm:p-8 space-y-6 text-center">
            
            {submittedOrder.status === 'completed' ? (
              /* Approved State */
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    অর্ডার অনুমোদিত (Approved)!
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    অভিনন্দন, {submittedOrder.customerName}!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">
                    এডমিন আপনার পেমেন্ট যাচাই করে অনুমোদন করেছেন। এখন আপনি পুরো ই-বুকটি অনলাইনে পড়তে পারবেন।
                  </p>
                </div>
              </div>
            ) : submittedOrder.status === 'rejected' ? (
              /* Rejected State */
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/30">
                    পেমেন্ট ভেরিফিকেশন বাতিল (Rejected)
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-2">
                    পেমেন্ট তথ্য যাচাই করা সম্ভব হয়নি
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">
                    আপনার দেওয়া TrxID বা মোবাইল নাম্বারে কোনো ত্রুটি থাকতে পারে। অনুগ্রহ করে হেল্পলাইনে যোগাযোগ করুন অথবা সঠিক তথ্য দিন।
                  </p>
                </div>
              </div>
            ) : (
              /* Pending State (Default after submission) */
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Clock className="w-9 h-9 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30">
                    অপেক্ষমান (Pending Verification)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    পেমেন্ট রিকোয়েস্ট জমা হয়েছে!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
                    এডমিন আপনার পেমেন্ট (TrxID) যাচাই করে এই নাম্বারের অর্ডারটি <strong>অনুমোদন (Approve)</strong> করার সাথে সাথেই আপনি এই ওয়েবসাইট থেকেই পড়তে পারবেন।
                  </p>
                </div>
              </div>
            )}

            {/* Workflow Progress Steps */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 max-w-lg mx-auto text-left space-y-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">অর্ডার প্রক্রিয়াকরণ ধাপ:</p>
              
              <div className="flex items-center gap-2.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>১. পেমেন্ট তথ্য ও TrxID সাবমিট সম্পন্ন</span>
              </div>
              
              <div className="flex items-center gap-2.5 text-xs">
                {submittedOrder.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-semibold">২. এডমিন কর্তৃক পেমেন্ট যাচাই ও অনুমোদন সম্পন্ন</span>
                  </>
                ) : submittedOrder.status === 'rejected' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-red-400 font-semibold">২. পেমেন্ট ভেরিফিকেশন ব্যর্থ হয়েছে</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0"></div>
                    <span className="text-amber-300 font-semibold">২. এডমিন পেমেন্ট যাচাই করছেন (অপেক্ষমান)</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {submittedOrder.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-bold">৩. ই-বুক পড়ার লাইসেন্স সক্রিয় হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-400">৩. অনুমোদনের সাথে সাথে মোবাইল নাম্বার দিয়ে লাইসেন্স আনলক</span>
                  </>
                )}
              </div>
            </div>

            {/* Order Summary Details */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-left space-y-2 max-w-lg mx-auto text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">অর্ডার ট্র্যাকিং আইডি:</span>
                <span className="font-mono font-bold text-white">{submittedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">প্রেরক মোবাইল নাম্বার:</span>
                <span className="font-mono text-slate-200">{submittedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">পেমেন্ট মেথড ও TrxID:</span>
                <span className="font-mono text-blue-400 uppercase font-bold">{submittedOrder.gateway} • {submittedOrder.trxId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">পরিশোধিত মূল্য:</span>
                <span className="font-bold text-emerald-400 font-mono">৳{submittedOrder.amount}</span>
              </div>
            </div>

            {/* Notification message from check */}
            {statusMessage && (
              <p className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg max-w-lg mx-auto">
                {statusMessage}
              </p>
            )}

            {/* VIP Facebook Group & 4 Bonuses Claim Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-950/90 via-indigo-950/70 to-slate-900 border-2 border-blue-500/50 shadow-2xl text-left space-y-3.5 max-w-lg mx-auto relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30">
                      অফিশিয়াল কমিউনিটি
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30 flex items-center gap-1">
                      <Gift className="w-3 h-3 text-amber-400" /> ৪টি বোনাস ও সাপোর্ট
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white leading-snug">
                    বাকি ৪টি স্পেশাল বোনাস ও লাইভ ই-কমার্স সাপোর্ট পেতে ফেসবুক গ্রুপে জয়েন করুন!
                  </h4>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <p className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>গ্রুপে যুক্ত হয়ে আপনি যা যা পাবেন:</span>
                </p>
                <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside pl-1">
                  <li><strong>বোনাস ১:</strong> ৫০+ ভেরিফায়েড লোকাল ও চায়না ড্রপশিপিং সাপ্লায়ার ডিরেক্টরি</li>
                  <li><strong>বোনাস ২:</strong> ১০X ROAS ফেসবুক ও টিকটক অ্যাড কপি টেমপ্লেট কালেকশন</li>
                  <li><strong>বোনাস ৩:</strong> অটোমেটেড প্রফিট ও ROI ক্যালকুলেটর এক্সেল/গুগল শিট</li>
                  <li><strong>বোনাস ৪:</strong> সার্বক্ষণিক লাইভ প্রবলেম সলভিং ও ই-কমার্স মেন্টরশিপ সাপোর্ট</li>
                </ul>
              </div>

              <a
                href="https://www.facebook.com/groups/4640838359521804"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>ভিআইপি ফেসবুক গ্রুপে জয়েন করুন (বোনাস ও সাপোর্ট)</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 max-w-lg mx-auto pt-1">
              {submittedOrder.status === 'completed' ? (
                <button
                  onClick={handleStartReading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>এখনই সম্পূর্ণ বই পড়া শুরু করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>এডমিন পেমেন্ট অনুমোদন (Approve) করার পর বইয়ের এক্সেস সক্রিয় হবে।</span>
                  </div>

                  <button
                    type="button"
                    onClick={checkLiveOrderStatus}
                    disabled={isCheckingStatus}
                    className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
                  >
                    <RefreshCw className={`w-4 h-4 text-white ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    <span>{isCheckingStatus ? 'অর্ডার স্ট্যাটাস যাচাই করা হচ্ছে...' : 'অর্ডার অনুমোদন হয়েছে কিনা চেক করুন (Check Status)'}</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                উইন্ডো বন্ধ করুন
              </button>

              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>পরবর্তীতে ওয়েবসাইটের <strong>"আগের কেনা বই পড়ুন"</strong> অপশনে আপনার মোবাইল নাম্বার দিয়ে সরাসরি বই পড়তে পারবেন।</span>
              </p>
            </div>

          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Book Item Preview Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center gap-3.5">
              <div className="w-14 h-20 rounded-lg overflow-hidden border border-slate-700 shadow-md shrink-0 bg-slate-900">
                <img 
                  src={bookCoverImg} 
                  alt={BOOK_DETAILS.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                    ই-বুক + ৪টি বোনাস
                  </span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-white truncate mt-1 font-['Outfit',sans-serif]">
                  {BOOK_DETAILS.title}
                </h4>
                <p className="text-[11px] text-slate-400">
                  লেখক: <span className="text-slate-300 font-semibold">{BOOK_DETAILS.author}</span> ({BOOK_DETAILS.authorTitle})
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="line-through text-slate-500 font-mono">৳{BOOK_DETAILS.regularPrice}</span>
                  <span className="text-emerald-400 font-extrabold font-mono">৳{BOOK_DETAILS.offerPrice}</span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                    ৮০% ছাড়
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1: Gateway Selection & Send Money Instructions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>১. পেমেন্ট মাধ্যম সিলেক্ট করুন ও সেন্ড মানি করুন</span>
                </h4>
              </div>

              {/* Notice Banner */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-200">জরুরি নির্দেশনা: </span>
                  <span>সবগুলো নাম্বারে অবশ্যই <strong>"Send Money" (সেন্ড মানি)</strong> করতে হবে। পেমেন্ট করার পর ফিরতি মেসেজের TrxID নিচে প্রদান করুন।</span>
                </div>
              </div>

              {/* Gateway Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {paymentConfigs.map((cfg) => {
                  const isSelected = selectedGateway === cfg.gateway;
                  return (
                    <button
                      key={cfg.gateway}
                      type="button"
                      onClick={() => setSelectedGateway(cfg.gateway)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 relative cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500/10 shadow-md ring-1 ring-blue-500' 
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <span className="font-extrabold text-sm text-white" style={{ color: cfg.color }}>
                        {cfg.nameBn}
                      </span>
                      <span className="text-[10px] text-slate-400">{cfg.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Gateway Account & Instruction Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">{currentConfig.nameBn} প্রাপক নাম্বার:</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                        Personal (সেন্ড মানি)
                      </span>
                    </div>
                    <p className="text-lg sm:text-xl font-mono font-black text-white tracking-wider mt-0.5">
                      {currentConfig.number}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(currentConfig.number)}
                    className="px-3.5 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNumber ? 'নাম্বার কপি হয়েছে' : 'নাম্বার কপি করুন'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="font-semibold text-slate-200">কীভাবে সেন্ড মানি করবেন:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 text-[11px] leading-relaxed">
                    {currentConfig.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Step 2: Customer Details & Payment Verification Form */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" />
                <span>২. আপনার তথ্য ও পেমেন্ট বিবরণ দিন</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="text-xs text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>আপনার পূর্ণ নাম <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ মোঃ আরিফুল ইসলাম"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>আপনার ইমেইল এড্রেস <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">ই-বুক এক্সেস ও নোটিফিকেশন এই ইমেইলে যাবে</span>
                </div>

                {/* Sender Mobile Number */}
                <div>
                  <label className="text-xs text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>যে নাম্বার থেকে টাকা পাঠিয়েছেন <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">এই নাম্বারটি দিয়েই পরবর্তীতে লগইন করে পড়তে পারবেন</span>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="text-xs text-slate-300 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Transaction ID (TrxID) <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ BKL8942JHX বা 9X76B12"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">সেন্ড মানি করার পর এসএমএস-এ পাওয়া TrxID</span>
                </div>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="ডিসকাউন্ট কুপন কোড (যেমন: ECOM20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  প্রয়োগ
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}

              {appliedCoupon && (
                <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>কুপন কোড '{appliedCoupon.code}' কার্যকর হয়েছে! ৳{appliedCoupon.discountAmount} অতিরিক্ত ছাড়।</span>
                </p>
              )}
            </div>

            {/* Price Summary Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">রেগুলার মূল্য:</span>
                <span className="line-through text-slate-500">৳{BOOK_DETAILS.regularPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">আজকের বিশেষ অফার মূল্য:</span>
                <span className="font-semibold text-white">৳{BOOK_DETAILS.offerPrice}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>কুপন ছাড়:</span>
                  <span>-৳{appliedCoupon.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-white border-t border-slate-800 pt-2">
                <span>সর্বমোট প্রদেয় মূল্য (সেন্ড মানি):</span>
                <span className="text-blue-400 font-mono">৳{finalPrice}</span>
              </div>
            </div>

            {/* Form Error Notice */}
            {formError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Action Submit Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{isSubmitting ? 'পেমেন্ট রিকোয়েস্ট সাবমিট হচ্ছে...' : `পেমেন্ট তথ্য সাবমিট করুন (৳${finalPrice})`}</span>
              </button>

              <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>এডমিন পেমেন্ট যাচাই করে অনুমোদন করার পর এই নাম্বার দিয়েই বইটি ওপেন হবে।</span>
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
