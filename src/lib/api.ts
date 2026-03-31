
'use client';

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment, 
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// --- Category API ---
export async function getCategories() {
  const q = query(collection(db, "categories"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCategoryBySlug(slug: string) {
  const q = query(collection(db, "categories"), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function createCategory(data: any) {
  const slugCheck = await getDocs(query(collection(db, "categories"), where("slug", "==", data.slug)));
  if (!slugCheck.empty) throw new Error("Slug must be unique.");
  return addDoc(collection(db, "categories"), { ...data, createdAt: serverTimestamp() });
}

// --- Product API ---
export async function getProducts(options: { 
  categoryId?: string; 
  limit?: number; 
  isFlashSale?: boolean;
  isNewArrival?: boolean;
} = {}) {
  let q = query(collection(db, "products"));
  
  if (options.categoryId) {
    q = query(q, where("categoryId", "==", options.categoryId));
  }
  
  if (options.isFlashSale) {
    q = query(q, where("isFlashSale", "==", true));
  }

  if (options.isNewArrival) {
    q = query(q, where("tags", "array-contains", "New Arrival"));
  }

  if (!options.categoryId && !options.isFlashSale && !options.isNewArrival) {
    q = query(q, orderBy("createdAt", "desc"));
  }

  if (options.limit) {
    q = query(q, limit(options.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getProductBySlug(slug: string) {
  const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function getProductVariants(productId: string) {
  const q = query(collection(db, "products", productId, "productVariants"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- Orders / POS API ---
export async function getOrders(status?: string) {
  let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  if (status) {
    q = query(q, where("status", "==", status));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error("Order not found");
  
  const currentOrder = orderSnap.data();
  const oldStatus = currentOrder.status;

  const batch = writeBatch(db);

  const statusesDeductStock = ["Accepted", "Delivered"];
  const statusesRestoreStock = ["Cancelled"];

  const shouldDeduct = statusesDeductStock.includes(newStatus) && !statusesDeductStock.includes(oldStatus);
  const shouldRestore = statusesRestoreStock.includes(newStatus) && statusesDeductStock.includes(oldStatus);

  if (shouldDeduct) {
    for (const item of currentOrder.items) {
      const prodRef = doc(db, "products", item.productId);
      batch.update(prodRef, { stock: increment(-item.quantity) });
    }
  } else if (shouldRestore) {
    for (const item of currentOrder.items) {
      const prodRef = doc(db, "products", item.productId);
      batch.update(prodRef, { stock: increment(item.quantity) });
    }
  }

  batch.update(orderRef, { status: newStatus, updatedAt: serverTimestamp() });
  await batch.commit();
}

// --- Coupon API ---
export async function getCoupons() {
  const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function validateCoupon(code: string, subtotal: number) {
  const q = query(
    collection(db, "coupons"), 
    where("code", "==", code.toUpperCase()), 
    where("isActive", "==", true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) throw new Error("Invalid coupon code.");
  
  const coupon: any = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  
  if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
    throw new Error("This coupon has reached its maximum usage limit.");
  }
  
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    throw new Error(`Minimum order amount for this coupon is Tk ${coupon.minOrderAmount}.`);
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((subtotal * (coupon.value / 100)));
  } else {
    discount = coupon.value;
  }

  return { ...coupon, discountAmount: discount };
}

// --- Analytics API ---
export async function getDashboardStats() {
  const snapshot = await getDocs(collection(db, "orders"));
  const orders = snapshot.docs.map(d => d.data());
  
  const totalSales = orders.filter(o => o.status !== 'Cancelled').reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalOrders = orders.length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  
  return {
    totalSales,
    totalProfit: 0, // Simplified for now
    totalOrders,
    cancelledOrders,
  };
}
