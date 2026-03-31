
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
    
    // Generate a simple human-readable sequence identifier
    const timestampId = Date.now().toString().slice(-4);
    const orderNum = `ID-0101-${timestampId}`;

    const orderData = {
      customerId: "anonymous",
      orderNumber: orderNum,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      deliveryRegion: formData.deliveryRegion,
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
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
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Something went wrong while placing your order. Please try again."
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-headline font-bold mb-4">Your bag is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md">Looks like you haven't added any elegant pieces to your collection yet.</p>
          <Button asChild size="lg" className="rounded-full px-10">
            <Link href="/products">Continue Shopping</Link>
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
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border shadow-sm hover:bg-primary hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <h1 className="font-headline text-4xl font-bold">Checkout</h1>
          </div>
          
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Delivery Info */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                      <Input 
                        id="fullName" 
                        placeholder="e.g. Jane Doe" 
                        required 
                        className="h-12 bg-muted/30 border-none focus-visible:ring-1"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="017XXXXXXXX" 
                        required 
                        className="h-12 bg-muted/30 border-none focus-visible:ring-1"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Street address, house, apartment, area..." 
                      required 
                      className="min-h-[120px] bg-muted/30 border-none focus-visible:ring-1 resize-none"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Region</Label>
                    <RadioGroup 
                      defaultValue="Inside Dhaka" 
                      onValueChange={(val) => setFormData({...formData, deliveryRegion: val})}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className={`flex items-center space-x-2 border-2 p-4 rounded-xl cursor-pointer transition-all ${formData.deliveryRegion === 'Inside Dhaka' ? 'border-primary bg-primary/5' : 'border-transparent bg-white shadow-sm hover:bg-muted/50'}`}>
                        <RadioGroupItem value="Inside Dhaka" id="r1" className="sr-only" />
                        <Label htmlFor="r1" className="flex-1 cursor-pointer">
                          <span className="font-bold block">Inside Dhaka</span>
                          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Tk 80 • 24-48 Hours</span>
                        </Label>
                        {formData.deliveryRegion === 'Inside Dhaka' && <Check className="w-5 h-5 text-primary" />}
                      </div>
                      <div className={`flex items-center space-x-2 border-2 p-4 rounded-xl cursor-pointer transition-all ${formData.deliveryRegion === 'Outside Dhaka' ? 'border-primary bg-primary/5' : 'border-transparent bg-white shadow-sm hover:bg-muted/50'}`}>
                        <RadioGroupItem value="Outside Dhaka" id="r2" className="sr-only" />
                        <Label htmlFor="r2" className="flex-1 cursor-pointer">
                          <span className="font-bold block">Outside Dhaka</span>
                          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Tk 150 • 3-5 Days</span>
                        </Label>
                        {formData.deliveryRegion === 'Outside Dhaka' && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" /> Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        placeholder="Enter code" 
                        className="uppercase h-12 bg-muted/30 border-none focus-visible:ring-1 font-bold tracking-widest" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                      />
                      {appliedCoupon && (
                        <Check className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {appliedCoupon ? (
                      <Button variant="outline" type="button" className="h-12 rounded-xl" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}>
                        Remove
                      </Button>
                    ) : (
                      <Button variant="secondary" type="button" className="h-12 px-8 rounded-xl" onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode}>
                        {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <Card className="border-none shadow-xl rounded-3xl sticky top-24 overflow-hidden bg-white">
                <CardHeader className="border-b bg-muted/10 p-8">
                  <CardTitle className="text-xl font-headline font-bold">Your Bag Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[350px] overflow-y-auto p-8 space-y-6">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-16 h-20 relative rounded-xl overflow-hidden border bg-muted flex-shrink-0 shadow-sm">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                            {item.variant ? `${item.variant.color} / ${item.variant.size}` : "One Size"}
                          </p>
                          <p className="text-xs font-medium text-primary mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">Tk {item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-8 pt-4 border-t space-y-3 bg-muted/5">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-bold text-foreground">Tk {total}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping Fee</span>
                      <span className="font-bold text-foreground">Tk {shippingCost}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1"><Ticket className="w-3 h-3" /> Discount ({appliedCoupon.code})</span>
                        <span>-Tk {discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold pt-6 border-t border-muted-foreground/10">
                      <span>Total Payable</span>
                      <span className="text-primary">Tk {finalTotal}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest pt-4">
                      Payment Method: Cash on Delivery
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-8">
                  <Button type="submit" size="lg" className="w-full h-16 text-xl rounded-2xl gap-2 shadow-lg shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>Confirm Order <ArrowRight className="w-5 h-5" /></>
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
