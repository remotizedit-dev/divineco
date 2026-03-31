
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCategories } from "@/lib/api";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-headline text-2xl font-bold text-primary">
            Divine.Co
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              All Products
            </Link>
            {categories.slice(0, 4).map(cat => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`} 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex rounded-full px-4" asChild>
            <Link href="/control-panel">Admin</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-300">
          <Link href="/products" className="block text-lg font-medium py-2 border-b" onClick={() => setIsMobileMenuOpen(false)}>
            All Products
          </Link>
          {categories.map(cat => (
            <Link 
              key={cat.id} 
              href={`/category/${cat.slug}`} 
              className="block text-lg font-medium py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/control-panel" className="block text-lg font-medium py-2 text-primary" onClick={() => setIsMobileMenuOpen(false)}>
            Admin Panel
          </Link>
        </div>
      )}
    </nav>
  );
}
