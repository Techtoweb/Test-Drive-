/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Curriculum } from './components/Curriculum';
import { BonusesSection } from './components/BonusesSection';
import { AuthorSection } from './components/AuthorSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { StickyBottomCta } from './components/StickyBottomCta';
import { CheckoutModal } from './components/CheckoutModal';
import { DrmReaderModal } from './components/DrmReaderModal';
import { AccessLookupModal } from './components/AccessLookupModal';
import { AdminPanel } from './components/AdminPanel';
import { SneakPeekModal } from './components/SneakPeekModal';
import { AuthModal } from './components/AuthModal';
import { 
  BOOK_DETAILS, 
  DEFAULT_PAYMENT_CONFIGS, 
  INITIAL_COUPONS, 
  INITIAL_ORDERS 
} from './data/bookData';
import { Order, PaymentConfig, Coupon, CustomerSession, UserProfile, AuthModalMode } from './types';
import { 
  subscribeToOrders, 
  subscribeToPaymentConfigs, 
  subscribeToCoupons,
  subscribeToAuth,
  logoutUser,
  saveOrderToFirestore,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  deleteAllOrdersFromFirestore,
  savePaymentConfigsToFirestore,
  saveCouponsToFirestore
} from './lib/firebase';

export default function App() {
  // Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDrmReaderOpen, setIsDrmReaderOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthModalMode>('login');

  // Active User & Reader Session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeSession, setActiveSession] = useState<CustomerSession | null>(null);

  // State with LocalStorage Persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('ecom360_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>(() => {
    try {
      const saved = localStorage.getItem('ecom360_payment_configs_v3');
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_CONFIGS;
    } catch {
      return DEFAULT_PAYMENT_CONFIGS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('ecom360_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [customPdfInfo, setCustomPdfInfo] = useState<{ name: string; dataUrl: string } | null>(() => {
    try {
      const saved = localStorage.getItem('ecom360_custom_pdf');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Real-time Firestore & Auth Synchronizations
  useEffect(() => {
    // 1. Subscribe to Live Orders from Firestore
    const unsubscribeOrders = subscribeToOrders((firestoreOrders) => {
      if (Array.isArray(firestoreOrders)) {
        setOrders(firestoreOrders);
      }
    });

    // 2. Subscribe to Payment Gateway Settings from Firestore
    const unsubscribePayments = subscribeToPaymentConfigs((dbConfigs) => {
      if (dbConfigs && dbConfigs.length > 0) {
        setPaymentConfigs(dbConfigs);
      }
    });

    // 3. Subscribe to Coupons from Firestore
    const unsubscribeCoupons = subscribeToCoupons((dbCoupons) => {
      if (dbCoupons && dbCoupons.length > 0) {
        setCoupons(dbCoupons);
      }
    });

    // 4. Subscribe to Firebase Auth User
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribeOrders();
      unsubscribePayments();
      unsubscribeCoupons();
      unsubscribeAuth();
    };
  }, []);

  // Persist state updates to local cache
  useEffect(() => {
    try {
      localStorage.setItem('ecom360_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('ecom360_payment_configs_v3', JSON.stringify(paymentConfigs));
    } catch {
      // ignore
    }
  }, [paymentConfigs]);

  useEffect(() => {
    try {
      localStorage.setItem('ecom360_coupons', JSON.stringify(coupons));
    } catch {
      // ignore
    }
  }, [coupons]);

  // Handle successful order creation (local state + Firebase Firestore)
  const handleOrderSuccess = (newOrder: Order, newSession: CustomerSession) => {
    setOrders(prev => {
      const exists = prev.some(o => o.id === newOrder.id || o.orderNumber === newOrder.orderNumber);
      return exists ? prev : [newOrder, ...prev];
    });
    saveOrderToFirestore(newOrder).catch((e) => console.warn('Firestore background save notice:', e));
  };

  // Sync admin updates with Firestore (handles additions, modifications, and deletions)
  const handleAdminUpdateOrders = (newOrdersList: Order[]) => {
    const currentOrders = [...orders];
    // Find removed orders to delete from Firestore
    const removedOrders = currentOrders.filter(
      oldOrder => !newOrdersList.some(n => n.id === oldOrder.id || n.orderNumber === oldOrder.orderNumber)
    );
    
    removedOrders.forEach(rem => {
      deleteOrderFromFirestore(rem.id).catch((e) => console.warn('Delete firestore order error:', e));
    });

    // Save or update existing orders
    newOrdersList.forEach((order) => {
      saveOrderToFirestore(order).catch((e) => console.warn('Order firestore sync error:', e));
    });

    setOrders(newOrdersList);
  };

  const handleDeleteSingleOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
    deleteOrderFromFirestore(orderId).catch(err => console.warn('Delete order error:', err));
  };

  const handleClearAllOrders = async (orderIdsToClear?: string[]) => {
    if (!orderIdsToClear || orderIdsToClear.length === 0 || orderIdsToClear.length >= orders.length) {
      setOrders([]);
      try {
        localStorage.removeItem('ecom360_orders');
      } catch {}
      await deleteAllOrdersFromFirestore().catch(err => console.warn('Clear all firestore error:', err));
    } else {
      setOrders(prev => prev.filter(o => !orderIdsToClear.includes(o.id) && !orderIdsToClear.includes(o.orderNumber)));
      await deleteAllOrdersFromFirestore(orderIdsToClear).catch(err => console.warn('Clear partial firestore error:', err));
    }
  };

  const handleAdminUpdatePaymentConfigs = (newConfigs: PaymentConfig[]) => {
    setPaymentConfigs(newConfigs);
    savePaymentConfigsToFirestore(newConfigs).catch((e) => console.warn('Payment configs firestore sync error:', e));
  };

  const handleAdminUpdateCoupons = (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    saveCouponsToFirestore(newCoupons).catch((e) => console.warn('Coupons firestore sync error:', e));
  };

  const handleOpenReaderDirectly = (session: CustomerSession) => {
    setActiveSession(session);
    setIsCheckoutOpen(false);
    setIsDrmReaderOpen(true);
  };

  // Handle access granted from lookup
  const handleAccessGranted = (session: CustomerSession) => {
    setActiveSession(session);
    setIsDrmReaderOpen(true);
  };

  // Hidden admin panel activation for site owner (e.g., via hash #admin, URL param ?admin=true, or shortcut Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminTrigger = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        setIsAdminOpen(true);
      }
    };

    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A or Alt + Shift + A opens admin panel securely
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Custom PDF Upload Handlers
  const handleUploadCustomPdf = (name: string, dataUrl: string) => {
    const info = { name, dataUrl };
    setCustomPdfInfo(info);
    try {
      localStorage.setItem('ecom360_custom_pdf', JSON.stringify(info));
    } catch {
      // ignore
    }
  };

  const handleRemoveCustomPdf = () => {
    setCustomPdfInfo(null);
    try {
      localStorage.removeItem('ecom360_custom_pdf');
    } catch {
      // ignore
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // Check if current logged in user has purchased the book
  const userPurchasedOrder = orders.find(
    o => o.status === 'completed' && (
      (currentUser?.email && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.phoneNumber && o.customerPhone === currentUser.phoneNumber)
    )
  );

  const handleOpenUserBook = () => {
    if (userPurchasedOrder) {
      setActiveSession({
        customerName: userPurchasedOrder.customerName || currentUser?.displayName || 'Customer',
        customerEmail: userPurchasedOrder.customerEmail || currentUser?.email || '',
        customerPhone: userPurchasedOrder.customerPhone || '',
        accessCode: userPurchasedOrder.accessCode,
        orderId: userPurchasedOrder.id,
        purchasedAt: userPurchasedOrder.approvedAt || userPurchasedOrder.createdAt,
      });
      setIsDrmReaderOpen(true);
    } else {
      setIsLookupOpen(true);
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Hind_Siliguri',sans-serif] selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onLogout={async () => {
          await logoutUser();
          setCurrentUser(null);
        }}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenAdmin={() => {
          if (currentUser?.isAdmin) {
            setIsAdminOpen(true);
          } else {
            setAuthMode('login');
            setIsAuthOpen(true);
          }
        }}
        pendingOrdersCount={pendingOrdersCount}
        hasPurchased={!!userPurchasedOrder}
        onOpenReader={handleOpenUserBook}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        <Hero
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onOpenPreview={() => setIsPreviewOpen(true)}
        />

        <Curriculum
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onReadChapter={(chapterIndex) => {
            // Open sneak peek preview
            setIsPreviewOpen(true);
          }}
        />

        <BonusesSection
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />

        <AuthorSection />

        <TestimonialsSection />

        <FaqSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        currentUser={currentUser}
      />

      {/* Sticky Bottom Call-to-Action Bar */}
      <StickyBottomCta
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout & Automated Mobile Banking Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        onOpenReaderDirectly={handleOpenReaderDirectly}
        paymentConfigs={paymentConfigs}
        coupons={coupons}
        allOrders={orders}
        currentUser={currentUser}
      />

      {/* Authentication Modal (Login, Signup, Forgot Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Protected Online DRM Reader Modal */}
      <DrmReaderModal
        isOpen={isDrmReaderOpen}
        onClose={() => setIsDrmReaderOpen(false)}
        session={activeSession}
        customPdfDataUrl={customPdfInfo?.dataUrl}
      />

      {/* Returning Reader Lookup Modal */}
      <AccessLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onAccessGranted={handleAccessGranted}
        orders={orders}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Free Sample Chapter Preview Modal */}
      <SneakPeekModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onOpenCheckout={() => {
          setIsPreviewOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateOrders={handleAdminUpdateOrders}
        onDeleteSingleOrder={handleDeleteSingleOrder}
        onClearAllOrders={handleClearAllOrders}
        paymentConfigs={paymentConfigs}
        onUpdatePaymentConfigs={handleAdminUpdatePaymentConfigs}
        coupons={coupons}
        onUpdateCoupons={handleAdminUpdateCoupons}
        customPdfName={customPdfInfo?.name || null}
        onUploadCustomPdf={handleUploadCustomPdf}
        onRemoveCustomPdf={handleRemoveCustomPdf}
        currentUser={currentUser}
      />
    </div>
  );
}
