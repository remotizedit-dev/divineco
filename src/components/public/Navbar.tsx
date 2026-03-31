'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/api";
import { CartSheet } from "./CartSheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store";

export function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useCartStore(state => state.items);
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 shadow-sm group-hover:scale-105 transition-transform">
              <Image src={logoUrl} alt="Divine.Co Logo" fill className="object-cover" />
            </div>
            <span className="font-headline text-2xl font-bold text-primary tracking-tight">Divine.Co</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Home</Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors outline-none">
                Categories <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-xl border-primary/5 p-2">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild>
                    <Link href={`/category/${cat.slug}`} className="cursor-pointer font-medium py-2 rounded-lg">
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/#new-arrivals" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">New Arrivals</Link>
            <Link href="/products" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">All Products</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-full transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            
            <CartSheet>
              <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </CartSheet>

            <button 
              className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t shadow-2xl p-6 space-y-4 animate-in slide-in-from-top-2">
          <Link href="/" className="block text-sm font-bold uppercase tracking-widest py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <div className="py-2 border-y">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Categories</p>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/category/${cat.slug}`} 
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/#new-arrivals" className="block text-sm font-bold uppercase tracking-widest py-2" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
          <Link href="/products" className="block text-sm font-bold uppercase tracking-widest py-2" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
        </div>
      )}
    </header>
  );
}