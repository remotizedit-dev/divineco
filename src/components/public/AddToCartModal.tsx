
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export function AddToCartModal({ isOpen, onClose, productName }: AddToCartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl overflow-hidden p-0">
        <div className="bg-primary/5 p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border-2 border-primary/10">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-headline font-bold">Added to Your Bag!</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm italic">
            "{productName}" has been successfully added.
          </p>
        </div>
        
        <div className="p-8 space-y-4">
          <Button asChild className="w-full h-14 rounded-2xl text-lg gap-2 shadow-lg shadow-primary/20">
            <Link href="/checkout">
              Checkout Now <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          
          <Button variant="outline" onClick={onClose} className="w-full h-14 rounded-2xl text-lg gap-2 border-primary/20 text-muted-foreground hover:bg-muted/30">
            <ShoppingBag className="w-5 h-5" /> Add More Items
          </Button>
        </div>
        
        <div className="bg-muted/10 p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Divine.Co Premium Shoe Store</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
