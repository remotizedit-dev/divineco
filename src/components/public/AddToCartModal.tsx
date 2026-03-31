'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export function AddToCartModal({ isOpen, onClose, productName }: AddToCartModalProps) {
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 border-none shadow-2xl">
        <DialogHeader className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <DialogTitle className="font-headline text-2xl font-bold">Added to Your Bag!</DialogTitle>
          <p className="text-muted-foreground text-sm">
            <span className="font-bold text-foreground">{productName}</span> has been successfully added to your premium footwear collection.
          </p>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleCheckout} 
            className="h-14 text-lg rounded-2xl gap-2 shadow-lg shadow-primary/20"
          >
            Order Now <ArrowRight className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="h-14 text-lg rounded-2xl gap-2 border-primary/20 text-primary hover:bg-primary/5"
          >
            <ShoppingBag className="w-5 h-5" /> Add More Items
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest mt-4">
          Quality Steps • Divine.Co
        </p>
      </DialogContent>
    </Dialog>
  );
}
