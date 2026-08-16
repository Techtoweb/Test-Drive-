export interface Chapter {
  id: number;
  title: string;
  titleEn: string;
  pagesCount: number;
  summary: string;
  highlights: string[];
  content: string; // rich markdown/html formatted text for reader
}

export interface BonusItem {
  id: string;
  title: string;
  value: number;
  icon: string;
  description: string;
  badge: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  monthlyRevenue?: string;
  verified: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export type PaymentGateway = 'bkash' | 'nagad' | 'rocket' | 'upay';

export interface PaymentConfig {
  gateway: PaymentGateway;
  name: string;
  nameBn: string;
  number: string;
  type: 'Personal' | 'Merchant' | 'Agent' | 'Personal (সেন্ড মানি)' | string;
  color: string;
  bgColor: string;
  logo: string;
  instructions: string[];
  ussdCode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  gateway: PaymentGateway;
  trxId: string;
  amount: number;
  discount: number;
  couponCode?: string;
  createdAt: string;
  approvedAt?: string;
  status: 'completed' | 'pending' | 'rejected';
  accessCode: string;
  isAutoVerified: boolean;
  notes?: string;
}

export interface Coupon {
  code: string;
  discountAmount: number;
  description: string;
  minSpend?: number;
  isActive: boolean;
}

export interface ReaderState {
  currentPage: number;
  totalPages: number;
  zoom: number; // 0.8 to 1.6
  theme: 'dark' | 'light' | 'sepia';
  fontSize: number; // 14 to 22
  isFullscreen: boolean;
  bookmarks: number[];
  sidebarOpen: boolean;
}

export interface CustomerSession {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  accessCode: string;
  orderId: string;
  purchasedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt?: string;
  isAdmin?: boolean;
}

export type AuthModalMode = 'login' | 'signup' | 'forgot';
