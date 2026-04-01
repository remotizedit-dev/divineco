'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const logoUrl = "https://scontent.fdac135-1.fna.fbcdn.net/v/t39.30808-6/628435890_122197311278360003_8388629514506424761_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeFHbPqMNMzeFabHnjPiUzvbas5aCNVn-kRqzloI1Wf6RHybfOk8Ngj71yZCJhpj75lVDwtqEovNxe0-O8o3FXav&_nc_ohc=u3Kitqoz264Q7kNvwGcn208&_nc_oc=AdrYML2ykAmp2oW7ealAClsd5IWtM7xA1YQy3ZjLWohDgf7J32UsUC3eFNA2cdSren_Y8T0nJ549vDNMLe-z84mL&_nc_zt=23&_nc_ht=scontent.fdac135-1.fna&_nc_gid=h1A5DOxHEA-tYX-YWh7LYQ&_nc_ss=7a3a8&oh=00_Afx1sjSxJn-9eMnWYoDYNIClTECgnuXBK_vHm0Jol6U2eQ&oe=69D1868C";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary/10 group-hover:border-primary/30 transition-colors shadow-sm">
              <Image src={logoUrl} alt="Divine.Co Logo" fill className="object-cover" />
            </div>
            <span className="font-headline text-xl md:text-2xl font-bold text-primary tracking-tight">Divine.Co</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Home</Link>
            <Link href="/products" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Collections</Link>
            <Link href="/#new-arrivals" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">New Arrivals</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
            
            <Link href="/checkout" className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <ShoppingBag className="w-6 h-6 text-foreground" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full bg-primary text-white text-[10px] border-2 border-white">
                  {itemCount}
                </Badge>
              )}
            </Link>

            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t absolute top-full left-0 w-full shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-[0.2em] border-b pb-4">Home</Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-[0.2em] border-b pb-4">Collections</Link>
            <Link href="/#new-arrivals" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-[0.2em] border-b pb-4">New Arrivals</Link>
            <Link href="/control-panel/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin Portal</Link>
          </div>
        </div>
      )}
    </nav>
  );
}