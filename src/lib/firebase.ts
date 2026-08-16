import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { Order, PaymentConfig, Coupon, UserProfile } from "../types";

export const firebaseConfig = {
  apiKey: "AIzaSyCkeUpChWy8Zk8tPS7YTc33QV3efbhfboM",
  authDomain: "e-book-a0a34.firebaseapp.com",
  projectId: "e-book-a0a34",
  storageBucket: "e-book-a0a34.firebasestorage.app",
  messagingSenderId: "17258279465",
  appId: "1:17258279465:web:f4e7e6de4aae78ae882238",
  measurementId: "G-P8KTVZ5CEH"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics support
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch (e) {
        console.warn("Analytics initialization notice:", e);
      }
    }
  });
}

// ----------------------------------------------------
// Authentication Helpers
// ----------------------------------------------------

const USERS_COLLECTION = "users";

/**
 * Deeply strips undefined values from an object or array to prevent Firestore setDoc errors
 */
export function cleanFirestoreData<T>(data: T): any {
  if (data === undefined) {
    return null;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanFirestoreData(item));
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleanObj[key] = cleanFirestoreData(value);
    }
  }
  return cleanObj;
}

export async function saveUserProfile(user: Partial<UserProfile> & { uid: string }): Promise<void> {
  try {
    const userDoc = doc(db, USERS_COLLECTION, user.uid);
    const cleaned = cleanFirestoreData({
      ...user,
      lastLoginAt: new Date().toISOString(),
    });
    await setDoc(userDoc, cleaned, { merge: true });
  } catch (err) {
    console.warn("Error saving user profile to Firestore:", err);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn("Error fetching user profile:", err);
    return null;
  }
}

export const ADMIN_EMAIL = "techtowebadmin@gmail.com";

export function checkIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const u = cred.user;
  const userEmail = u.email || email;
  const profile: UserProfile = {
    uid: u.uid,
    email: userEmail,
    displayName: u.displayName || userEmail.split('@')[0],
    phoneNumber: u.phoneNumber || undefined,
    photoURL: u.photoURL || undefined,
    isAdmin: checkIsAdmin(userEmail),
  };
  await saveUserProfile(profile);
  return profile;
}

export async function signupWithEmail(name: string, email: string, pass: string, phone?: string): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const u = cred.user;
  if (name) {
    await updateProfile(u, { displayName: name });
  }
  const userEmail = u.email || email;
  const profile: UserProfile = {
    uid: u.uid,
    email: userEmail,
    displayName: name || userEmail.split('@')[0],
    phoneNumber: phone || undefined,
    createdAt: new Date().toISOString(),
    isAdmin: checkIsAdmin(userEmail),
  };
  await saveUserProfile(profile);
  return profile;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const cred = await signInWithPopup(auth, googleProvider);
  const u = cred.user;
  const userEmail = u.email || '';
  const profile: UserProfile = {
    uid: u.uid,
    email: userEmail,
    displayName: u.displayName || 'Google User',
    photoURL: u.photoURL || undefined,
    isAdmin: checkIsAdmin(userEmail),
  };
  await saveUserProfile(profile);
  return profile;
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, async (fireUser: User | null) => {
    if (fireUser) {
      const stored = await getUserProfile(fireUser.uid);
      const userEmail = fireUser.email || '';
      const profile: UserProfile = {
        uid: fireUser.uid,
        email: userEmail,
        displayName: stored?.displayName || fireUser.displayName || userEmail.split('@')[0] || 'User',
        phoneNumber: stored?.phoneNumber || fireUser.phoneNumber || undefined,
        photoURL: fireUser.photoURL || undefined,
        isAdmin: checkIsAdmin(userEmail),
      };
      callback(profile);
    } else {
      callback(null);
    }
  });
}

// ----------------------------------------------------
// Firestore Collections & Helpers
// ----------------------------------------------------

const ORDERS_COLLECTION = "orders";
const SETTINGS_COLLECTION = "app_settings";

/**
 * Save new order into Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    const cleaned = cleanFirestoreData({
      ...order,
      _updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
    console.log("Order saved to Firestore successfully:", order.id);
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    throw error;
  }
}

/**
 * Update order status or fields in Firestore
 */
export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const cleaned = cleanFirestoreData({
      ...updates,
      _updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, cleaned);
    console.log("Order updated in Firestore successfully:", orderId);
  } catch (error) {
    console.error("Error updating order in Firestore:", error);
    throw error;
  }
}

/**
 * Delete order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(docRef);
    console.log("Order deleted from Firestore successfully:", orderId);
  } catch (error) {
    console.error("Error deleting order from Firestore:", error);
    throw error;
  }
}

/**
 * Listen to live real-time orders from Firestore
 */
export function subscribeToOrders(
  onSuccess: (orders: Order[]) => void, 
  onError?: (err: any) => void
): () => void {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Order;
          list.push(data);
        });
        onSuccess(list);
      },
      (error) => {
        console.warn("Firestore live orders subscription notice:", error);
        // Fallback: load all without orderBy if index is building
        const fallbackCol = collection(db, ORDERS_COLLECTION);
        onSnapshot(fallbackCol, (snap) => {
          const list: Order[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as Order);
          });
          onSuccess(list);
        }, onError);
      }
    );
  } catch (err) {
    console.error("Failed to setup orders listener:", err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save payment gateway configs to Firestore
 */
export async function savePaymentConfigsToFirestore(configs: PaymentConfig[]): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "payment_configs");
    const cleaned = cleanFirestoreData({ configs, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.error("Error saving payment configs to Firestore:", err);
  }
}

/**
 * Subscribe to payment configs in Firestore
 */
export function subscribeToPaymentConfigs(onSuccess: (configs: PaymentConfig[]) => void): () => void {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "payment_configs");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.configs)) {
          onSuccess(data.configs);
        }
      }
    });
  } catch (err) {
    console.warn("Payment configs listener error:", err);
    return () => {};
  }
}

/**
 * Save coupons to Firestore
 */
export async function saveCouponsToFirestore(coupons: Coupon[]): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "coupons");
    const cleaned = cleanFirestoreData({ coupons, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.error("Error saving coupons to Firestore:", err);
  }
}

/**
 * Subscribe to coupons in Firestore
 */
export function subscribeToCoupons(onSuccess: (coupons: Coupon[]) => void): () => void {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "coupons");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.coupons)) {
          onSuccess(data.coupons);
        }
      }
    });
  } catch (err) {
    console.warn("Coupons listener error:", err);
    return () => {};
  }
}
