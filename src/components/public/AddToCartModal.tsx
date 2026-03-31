
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export function AddToCartModal({ isOpen, onClose, productName }: AddToCartModalProps) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-2">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold">Added to Bag!</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm pt-2">
              <span className="font-bold text-foreground">"{productName}"</span> has been successfully added to your shopping collection.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="grid gap-3 pt-6">
          <Button size="lg" className="h-14 rounded-2xl text-lg gap-2 shadow-lg shadow-primary/20" onClick={() => router.push('/checkout')}>
            Order Now <ArrowRight className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="h-14 rounded-2xl text-lg gap-2 border-primary/20 text-muted-foreground hover:text-primary" onClick={onClose}>
            <ShoppingBag className="w-5 h-5" /> Add More Items
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
