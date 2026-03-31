
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, ShoppingBag, Phone, MapPin, Calendar, Hash } from "lucide-react";
import html2canvas from "html2canvas";
import { useFirestore } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (id && firestore) {
      const orderRef = doc(firestore, "orders", id as string);
      const unsubscribe = onSnapshot(orderRef, (snap) => {
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [id, firestore]);

  const saveAsImage = async () => {
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const link = document.createElement("a");
      link.download = `DivineCo-Invoice-${order?.id.substring(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-headline italic">Generating your invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-headline font-bold mb-4">Order Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const orderDate = order.createdAt?.seconds 
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }) 
    : "Recently placed";

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-headline text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Your beautiful selection is on its way.</p>
        </div>

        {/* Invoice Printable Area */}
        <div ref={invoiceRef} className="bg-white rounded-2xl border shadow-xl overflow-hidden mb-8">
          {/* Invoice Header */}
          <div className="bg-primary p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="font-headline text-4xl font-bold tracking-tight">Divine.Co</h2>
                <p className="text-primary-foreground/80 text-sm mt-1 uppercase tracking-widest font-medium">Premium Boutique Experience</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                  <Hash className="w-4 h-4" /> Order #ID-{order.id.substring(0, 6).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b pb-2">Customer Details</h3>
                <div className="space-y-3">
                  <p className="text-lg font-bold text-foreground">{order.customerName}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
                      <Phone className="w-4 h-4" />
                    </div>
                    {order.customerPhone}
                  </div>
                  <div className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary mt-0.5 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    {order.customerAddress}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b pb-2">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" /> {orderDate}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ShoppingBag className="w-4 h-4" /> {order.paymentMethod}
                  </div>
                  <div className="pt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      Status: {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b pb-4 mb-6">Items Purchased</h3>
              <div className="space-y-6">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-6 group">
                    <div className="w-20 h-24 relative rounded-xl overflow-hidden border bg-muted shrink-0 shadow-sm">
                      <Image 
                        src={item.image || 'https://picsum.photos/seed/placeholder/200/300'} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-foreground truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground italic">
                        {item.variant ? `${item.variant.color} / ${item.variant.size}` : "One Size"}
                      </p>
                      <p className="text-xs font-medium text-primary mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">Tk {item.price * item.quantity}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Tk {item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t-2 border-dashed space-y-4 max-w-xs ml-auto">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">Tk {order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping Cost</span>
                <span className="font-medium text-foreground">Tk {order.shippingCost}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <span>Discount</span>
                  <span>-Tk {order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold pt-4 border-t border-muted">
                <span className="text-primary">Total</span>
                <span className="text-primary">Tk {order.total}</span>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Thank you for choosing Divine.Co</p>
              <p className="text-[10px] text-muted-foreground italic">Visit us again at www.divine.co</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 h-14 text-lg rounded-full gap-2 shadow-lg" onClick={saveAsImage}>
            <Download className="w-5 h-5" /> Download Invoice
          </Button>
          <Button variant="outline" className="flex-1 h-14 text-lg rounded-full gap-2 border-primary text-primary" asChild>
            <Link href="/">
              <ShoppingBag className="w-5 h-5" /> Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
