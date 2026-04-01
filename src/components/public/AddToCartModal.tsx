'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
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
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-3xl">
        <div className="bg-green-500 p-6 flex items-center justify-center gap-2 text-white">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <p className="font-bold text-sm uppercase tracking-widest">Added to your bag</p>
        </div>
        
        <div className="p-8">
          <div className="flex gap-6 mb-8">
            <div className="w-24 h-32 relative rounded-2xl overflow-hidden border shadow-sm shrink-0">
              <Image src={productImage} alt={productName} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-headline font-bold text-xl mb-1">{productName}</h3>
              <p className="text-muted-foreground text-sm mb-2">Quantity: {quantity}</p>
              <p className="text-primary font-bold text-lg">Tk {productPrice * quantity}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button asChild size="lg" className="h-14 rounded-2xl text-lg gap-2 shadow-lg shadow-primary/20">
              <Link href="/checkout">
                Checkout Now <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 rounded-2xl text-lg gap-2 border-primary/20" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
