'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CheckCircle2, ArrowRight } from "lucide-react";
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

export function AddToCartModal({ isOpen, onClose, productName, productPrice, productImage, quantity }: AddToCartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <div className="bg-green-500 p-6 flex items-center justify-center gap-3 text-white">
          <CheckCircle2 className="w-8 h-8" />
          <h2 className="text-xl font-headline font-bold">Successfully Added!</h2>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="flex gap-4 items-center mb-8 bg-muted/30 p-4 rounded-2xl">
            <div className="relative w-20 h-24 rounded-xl overflow-hidden border bg-white shrink-0">
              <Image src={productImage} alt={productName} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg text-foreground line-clamp-1">{productName}</p>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-sm text-muted-foreground font-medium">Qty: <span className="text-foreground">{quantity}</span></p>
                <p className="text-primary font-bold">Tk {productPrice * quantity}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button asChild size="lg" className="h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" onClick={onClose}>
              <Link href="/checkout">
                <ShoppingBag className="w-5 h-5 mr-2" /> Complete Order
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 rounded-2xl text-lg font-bold border-2" onClick={onClose}>
              Add More Items <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
