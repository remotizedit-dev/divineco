
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, ShoppingBag } from "lucide-react";
import html2canvas from "html2canvas";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const orderRef = doc(db, "orders", id as string);
      getDoc(orderRef).then(snap => {
        if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      });
    }
  }, [id]);

  const saveAsImage = async () => {
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current);
      const link = document.createElement("a");
      link.download = `DivineCo-Order-${order?.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  if (!order) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-headline text-3xl font-bold mb-2">Thank you for your order!</h1>
          <p className="text-muted-foreground">Your order #{order.id} has been placed successfully.</p>
        </div>

        <div ref={invoiceRef} className="bg-white p-8 rounded-xl border shadow-sm mb-8">
          <div className="flex justify-between items-start mb-8 pb-8 border-b">
            <div>
              <h2 className="font-headline text-2xl font-bold text-primary mb-1">Divine.Co</h2>
              <p className="text-xs text-muted-foreground">Premium Boutique Experience</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold mb-1">Invoice Info</p>
              <p>Order ID: {order.id}</p>
              <p>Date: {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Shipping Details</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">{order.customerName}</p>
              <p>{order.customerPhone}</p>
              <p>{order.customerAddress}</p>
              <p>Payment: {order.paymentMethod}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} × Tk {item.price}</p>
                  </div>
                  <p className="font-bold">Tk {item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Tk {order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>Tk {order.shippingCost}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-primary">
                <span>Discount</span>
                <span>-Tk {order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-4">
              <span>Total</span>
              <span>Tk {order.total}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 h-12 gap-2" onClick={saveAsImage}>
            <Download className="w-4 h-4" /> Save as Image
          </Button>
          <Button variant="outline" className="flex-1 h-12 gap-2" asChild>
            <a href="/">
              <ShoppingBag className="w-4 h-4" /> Back to Shop
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
