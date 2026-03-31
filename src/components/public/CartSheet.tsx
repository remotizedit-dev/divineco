
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
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
          <SheetTitle className="font-headline text-2xl">Your Bag</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {items.length > 0 ? (
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variant?.color}-${item.variant?.size}`} className="flex gap-4">
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.variant.color} / {item.variant.size}
                          </p>
                        )}
                        <p className="font-bold text-primary mt-1">Tk {item.price}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, `${item.variant?.color || ''}-${item.variant?.size || ''}`)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, `${item.variant?.color || ''}-${item.variant?.size || ''}`)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id, `${item.variant?.color || ''}-${item.variant?.size || ''}`)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6 font-headline italic">Your bag is currently empty.</p>
              <Button asChild className="rounded-full px-8">
                <Link href="/products">Browse Collections</Link>
              </Button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t bg-muted/20 sm:flex-col">
            <div className="flex justify-between items-center mb-6 w-full">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="text-xl font-bold">Tk {total}</span>
            </div>
            <Button className="w-full h-14 text-lg rounded-full" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest">
              Shipping & taxes calculated at checkout
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
