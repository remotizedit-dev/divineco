'use client';

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="font-headline text-2xl flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" /> Your Shopping Bag
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {items.length > 0 ? (
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                {items.map((item, idx) => {
                  const variantKey = `${item.variant?.color || ''}-${item.variant?.size || ''}`;
                  return (
                    <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                      <div className="relative w-24 h-28 bg-muted rounded-xl overflow-hidden border shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic">
                          {item.variant ? `${item.variant.color} / Size ${item.variant.size}` : "Standard"}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border rounded-full px-2 py-1 gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1, variantKey)}
                              className="p-1 hover:bg-muted rounded-full transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1, variantKey)}
                              className="p-1 hover:bg-muted rounded-full transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-bold text-sm text-primary">Tk {item.price * item.quantity}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id, variantKey)}
                        className="self-start p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-headline text-xl font-bold mb-2">Bag is empty</h3>
              <p className="text-sm text-muted-foreground mb-8">Discover our premium footwear collection to find your perfect pair.</p>
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link href="/products">Browse Collections</Link>
              </Button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t bg-muted/5 sm:flex-col sm:space-x-0">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Subtotal</span>
                <span className="text-2xl font-bold text-primary">Tk {total}</span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest mb-4">
                Shipping calculated at checkout
              </p>
              <Button asChild size="lg" className="w-full h-14 rounded-2xl text-lg gap-2 shadow-lg shadow-primary/20 group">
                <Link href="/checkout">
                  Order Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}