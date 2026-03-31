'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
        <div className="bg-primary p-8 text-white flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <DialogTitle className="text-2xl font-headline font-bold mb-1">Added to Selection</DialogTitle>
          <DialogDescription className="text-primary-foreground/80 italic">
            A premium pair has been added to your bag.
          </DialogDescription>
        </div>

        <div className="p-8">
          <div className="flex gap-6 mb-8 items-center bg-muted/30 p-4 rounded-2xl border border-dashed border-primary/20">
            <div className="relative w-20 h-24 rounded-xl overflow-hidden border shadow-sm shrink-0 bg-white">
              <Image src={productImage} alt={productName} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight truncate">{productName}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Qty: {quantity}</span>
                <span className="text-xl font-bold text-primary">Tk {productPrice * quantity}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-14 rounded-2xl border-primary text-primary hover:bg-primary/5 font-bold"
              onClick={onClose}
            >
              Add More Items
            </Button>
            <Button asChild className="h-14 rounded-2xl gap-2 shadow-lg shadow-primary/10">
              <Link href="/checkout">
                Order Now <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="p-4 bg-muted/50 border-t text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Divine.Co Premium Shoe Store</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}