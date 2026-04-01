'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-headline text-2xl font-bold text-primary">
          Divine.Co
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Shop</Link>
          <Link href="/#new-arrivals" className="text-sm font-medium hover:text-primary transition-colors">New Arrivals</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/checkout" className="group relative p-2 transition-all hover:bg-muted rounded-full">
            <ShoppingBag className="w-6 h-6 transition-transform group-hover:scale-110" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-6">
                <div className="flex flex-col gap-6 mt-10">
                  <Link href="/" className="text-lg font-bold hover:text-primary transition-colors">Home</Link>
                  <Link href="/products" className="text-lg font-bold hover:text-primary transition-colors">Shop</Link>
                  <Link href="/#new-arrivals" className="text-lg font-bold hover:text-primary transition-colors">New Arrivals</Link>
                  <Link href="/checkout" className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-bold text-sm">Shopping Bag</span>
                    </div>
                    <span className="bg-primary text-white text-[10px] px-2 py-1 rounded-full font-bold">
                      {mounted ? itemCount : 0}
                    </span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
