
'use client';

import { useState } from "react";
import { Navbar } from "@/components/public/Navbar";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowRight, ShieldCheck, Truck, Ticket, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp, doc, increment } from "firebase/firestore";
import { validateCoupon } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    deliveryRegion: "Inside Dhaka"
  });

  const shippingCost = formData.deliveryRegion === "Inside Dhaka" ? 80 : 150;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = total + shippingCost - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode, total);
      setAppliedCoupon(result);
      toast({ title: "Coupon Applied", description: `You saved Tk ${result.discountAmount}!` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Invalid Coupon", description: err.message });
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || items.length === 0) return;

    setIsSubmitting(true);
    
    const orderData = {
      customerId: "anonymous",
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      deliveryRegion: formData.deliveryRegion,
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant || null
      })),
      subtotal: total,
      shippingCost: shippingCost,
      discount: discountAmount,
      couponCodeUsed: appliedCoupon?.code || null,
      total: finalTotal,
      status: "Pending",
      paymentMethod: "Cash on Delivery",
      isPaid: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const orderRef = await addDocumentNonBlocking(collection(firestore, "orders"), orderData);
      
      // Update coupon usage count if applied
      if (appliedCoupon) {
        updateDocumentNonBlocking(doc(firestore, "coupons", appliedCoupon.id), {
          usesCount: increment(1)
        });
      }

      if (orderRef) {
        clearCart();
        router.push(`/order-confirmation/${orderRef.id}`);
      }
    } catch (err) {
      console.error("Order failed:", err);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-headline font-bold mb-4">Your bag is empty</h2>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/products">Go Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-headline text-3xl font-bold mb-8">Checkout</h1>
          
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Delivery Info */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        placeholder="e.g. Jane Doe" 
                        required 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="017XXXXXXXX" 
                        required 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Detailed Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Street address, house, apartment..." 
                      required 
                      className="min-h-[100px]"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Delivery Region</Label>
                    <RadioGroup 
                      defaultValue="Inside Dhaka" 
                      onValueChange={(val) => setFormData({...formData, deliveryRegion: val})}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="Inside Dhaka" id="r1" />
                        <Label htmlFor="r1" className="flex-1 cursor-pointer">
                          <span className="font-bold">Inside Dhaka</span>
                          <span className="block text-xs text-muted-foreground">Tk 80 (24-48 hours)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="Outside Dhaka" id="r2" />
                        <Label htmlFor="r2" className="flex-1 cursor-pointer">
                          <span className="font-bold">Outside Dhaka</span>
                          <span className="block text-xs text-muted-foreground">Tk 150 (3-5 days)</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" /> Coupon Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        placeholder="Enter coupon code" 
                        className="uppercase" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                      />
                      {appliedCoupon && (
                        <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {appliedCoupon ? (
                      <Button variant="outline" type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}>
                        Remove
                      </Button>
                    ) : (
                      <Button variant="secondary" type="button" onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode}>
                        {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                      </Button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 font-bold mt-2">
                      Coupon "{appliedCoupon.code}" applied successfully!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <Card className="border-none shadow-sm sticky top-24">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[300px] overflow-y-auto p-6 space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-12 h-16 relative rounded overflow-hidden border bg-muted flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-sm">Tk {item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 pt-0 border-t space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground mt-4">
                      <span>Subtotal</span>
                      <span>Tk {total}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping ({formData.deliveryRegion})</span>
                      <span>Tk {shippingCost}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-primary font-bold">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-Tk {discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-4 border-t">
                      <span>Total Payable</span>
                      <span className="text-primary">Tk {finalTotal}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6">
                  <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Complete Order <ArrowRight className="w-5 h-5" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
