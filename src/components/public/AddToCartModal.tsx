'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleGoToCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
        {/* Header Section */}
        <div className="bg-primary p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
          <DialogTitle className="text-2xl font-headline font-bold mb-1">Added to Bag</DialogTitle>
          <p className="text-white/80 text-xs uppercase tracking-widest font-medium">A premium pair has been reserved</p>
        </div>

        {/* Product Info Section */}
        <div className="p-6 md:p-8 bg-white">
          <div className="flex items-center gap-5 p-4 rounded-2xl border border-dashed border-primary/20 bg-primary/[0.02] mb-8">
            <div className="relative w-20 h-24 rounded-xl overflow-hidden border bg-muted flex-shrink-0">
              <Image src={productImage} alt={productName} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-2 mb-1">{productName}</h4>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Qty: {quantity}</p>
              <p className="text-sm font-bold text-primary mt-1">Tk {productPrice * quantity}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handleGoToCheckout}
              className="w-full h-14 rounded-2xl text-base font-bold gap-2 shadow-lg shadow-primary/20"
            >
              Order Now <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full h-14 rounded-2xl text-base font-bold border-primary/20 text-primary hover:bg-primary/5"
            >
              Add More Items
            </Button>
          </div>
        </div>

        {/* Footer Accent */}
        <div className="bg-muted/30 py-4 px-8 text-center border-t">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">Divine.Co Premium Steps</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
