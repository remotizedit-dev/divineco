
'use client';

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore(state => state.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const categoriesQuery = useMemoFirebase(() => collection(require("@/lib/firebase").db, "categories"), []);
  const { data: categories } = useCollection(categoriesQuery);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="font-headline text-3xl font-bold text-primary tracking-tighter">
            Divine.Co
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#new-arrivals" className="text-sm font-medium hover:text-primary transition-colors">
              New Arrivals
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
                Categories <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {categories?.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild>
                    <Link href={`/category/${cat.slug}`} className="w-full">
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {!categories?.length && <DropdownMenuItem disabled>Loading...</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Our Collections
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <CartSheet>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </CartSheet>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 animate-in slide-in-from-top duration-300">
          <Link href="/#new-arrivals" className="block text-lg font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>
            New Arrivals
          </Link>
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Categories</p>
            {categories?.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`} 
                className="block text-lg font-medium py-1 pl-2 border-l-2 border-transparent hover:border-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <Link href="/products" className="block text-lg font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>
            Full Collection
          </Link>
        </div>
      )}
    </nav>
  );
}
