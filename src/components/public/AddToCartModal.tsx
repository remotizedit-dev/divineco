'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
}

export function AddToCartModal({ 
  isOpen, 
  onClose, 
  productName, 
  productPrice, 
  productImage,
  quantity 
}: AddToCartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-green-50 p-6 flex items-center gap-3 border-b border-green-100">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <p className="font-bold text-green-800 text-sm">Product added to your bag!</p>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="flex gap-5 mb-8">
            <div className="relative w-24 h-32 rounded-2xl overflow-hidden border bg-muted shrink-0 shadow-sm">
              <Image src={productImage} alt={productName} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center min-w-0 py-1">
              <h3 className="font-headline font-bold text-xl mb-1 truncate">{productName}</h3>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qty: {quantity}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">•</span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price: Tk {productPrice}</span>
              </div>
              <p className="text-primary font-bold text-xl">Total: Tk {productPrice * quantity}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full h-14 rounded-2xl text-lg gap-2 shadow-lg shadow-primary/20" asChild onClick={onClose}>
              <Link href="/checkout">
                Order Now <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-medium border-muted text-muted-foreground hover:bg-muted/30" onClick={onClose}>
              Add More Items
            </Button>
          </div>
        </div>
        
        <div className="px-6 pb-6 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Free Delivery on orders above Tk 5000
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
