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
  CollectionReference,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

// --- Category API ---
export async function getCategories() {
  const q = query(collection(db, "categories"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  
  if (options.categoryId) {
    q = query(collection(db, "products"), where("categoryId", "==", options.categoryId), orderBy("createdAt", "desc"));
  }
  
  if (options.isFlashSale) {
    q = query(collection(db, "products"), where("isFlashSale", "==", true), orderBy("createdAt", "desc"));
  }

  if (options.isNewArrival) {
    q = query(collection(db, "products"), where("tags", "array-contains", "New Arrival"), orderBy("createdAt", "desc"));
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

export async function searchProducts(searchTerm: string) {
  const q = query(
    collection(db, "products"),
    where("name", ">=", searchTerm),
    where("name", "<=", searchTerm + "\uf8ff"),
    limit(5)
  );
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

export async function getCustomerByPhone(phone: string) {
  const q = query(collection(db, "orders"), where("customerPhone", "==", phone), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const data: any = snapshot.docs[0].data();
  return { 
    name: data.customerName, 
    email: data.customerEmail, 
    address: data.customerAddress,
    phone: data.customerPhone 
  };
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error("Order not found");
  
  const currentOrder = orderSnap.data();
  const oldStatus = currentOrder.status;

  const batch = writeBatch(db);

  // Stock deduction logic
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

export async function createOrder(orderData: any) {
  return addDoc(collection(db, "orders"), {
    ...orderData,
    status: "Pending",
    createdAt: serverTimestamp(),
  });
}

// --- Analytics API ---
export async function getDashboardStats() {
  const snapshot = await getDocs(collection(db, "orders"));
  const orders = snapshot.docs.map(d => d.data());
  
  const totalSales = orders.filter(o => o.status !== 'Cancelled').reduce((acc, curr) => acc + curr.total, 0);
  const totalProfit = orders.filter(o => o.status !== 'Cancelled').reduce((acc, curr) => acc + (curr.total - (curr.cost || 0)), 0);
  
  return {
    totalSales,
    totalProfit,
    totalOrders: orders.length,
    cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
  };
}
