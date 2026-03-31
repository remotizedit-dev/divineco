'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, ArrowRight, X } from "lucide-react";
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
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-primary p-8 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Added to Your Bag</h3>
            <p className="text-primary-foreground/80 text-sm mt-1">Excellent choice! What's your next move?</p>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-white">
          <div className="flex gap-6 p-4 rounded-2xl bg-muted/30 border border-muted">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm shrink-0">
              <Image src={productImage || 'https://picsum.photos/seed/placeholder/200/200'} alt={productName} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h4 className="font-bold text-lg leading-tight truncate">{productName}</h4>
              <p className="text-sm text-muted-foreground mt-1">Quantity: {quantity}</p>
              <p className="text-primary font-bold text-xl mt-2">Tk {productPrice * quantity}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="h-14 rounded-2xl border-primary text-primary hover:bg-primary/5 font-bold" onClick={onClose}>
              Add More Items
            </Button>
            <Button className="h-14 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20" asChild>
              <Link href="/checkout">
                Order Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
