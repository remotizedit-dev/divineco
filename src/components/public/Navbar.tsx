'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/api";
import { CartSheet } from "./CartSheet";
import { ChevronDown, Search, Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/lib/store";

export function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const logoUrl = "https://scontent.fdac135-1.fna.fbcdn.net/v/t39.30808-6/628435890_122197311278360003_8388629514506424761_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeFHbPqMNMzeFabHnjPiUzvbas5aCNVn-kRqzloI1Wf6RHybfOk8Ngj71yZCJhpj75lVDwtqEovNxe0-O8o3FXav&_nc_ohc=u3Kitqoz264Q7kNvwGcn208&_nc_oc=AdrYML2ykAmp2oW7ealAClsd5IWtM7xA1YQy3ZjLWohDgf7J32UsUC3eFNA2cdSren_Y8T0nJ549vDNMLe-z84mL&_nc_zt=23&_nc_ht=scontent.fdac135-1.fna&_nc_gid=h1A5DOxHEA-tYX-YWh7LYQ&_nc_ss=7a3a8&oh=00_Afx1sjSxJn-9eMnWYoDYNIClTECgnuXBK_vHm0Jol6U2eQ&oe=69D1868C";

  useEffect(() => {
    getCategories().then(setCategories);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-white py-4"
    )}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary/10 shadow-sm">
              <Image src={logoUrl} alt="Divine.Co Logo" fill className="object-cover" />
            </div>
            <span className="font-headline text-xl md:text-2xl font-bold text-primary tracking-tight">Divine.Co</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors">Home</Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors outline-none">
                Categories <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 rounded-2xl p-2 shadow-xl border-none">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild>
                    <Link href={`/category/${cat.slug}`} className="cursor-pointer text-xs font-bold uppercase tracking-widest p-3 rounded-xl hover:bg-primary/5">
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/#new-arrivals" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors">New Arrivals</Link>
            <Link href="/products" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors">All Products</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 hover:text-primary transition-colors hidden md:block">
              <Search className="w-5 h-5" />
            </button>
            <CartSheet>
              <button className="relative p-2 hover:text-primary transition-colors">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-primary text-white text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </CartSheet>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn(
        "lg:hidden fixed inset-0 top-[60px] bg-white z-40 transition-transform duration-300 transform",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col p-6 space-y-6">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest border-b pb-4">Home</Link>
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Collections</p>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-foreground/80 pl-4"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <Link href="/#new-arrivals" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest border-b pb-4">New Arrivals</Link>
          <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest border-b pb-4">All Products</Link>
        </div>
      </div>
    </header>
  );
}
