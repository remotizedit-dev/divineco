'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const cartItems = useCartStore(state => state.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const logoUrl = "https://scontent.fdac135-1.fna.fbcdn.net/v/t39.30808-6/628435890_122197311278360003_8388629514506424761_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeFHbPqMNMzeFabHnjPiUzvbas5aCNVn-kRqzloI1Wf6RHybfOk8Ngj71yZCJhpj75lVDwtqEovNxe0-O8o3FXav&_nc_ohc=u3Kitqoz264Q7kNvwGcn208&_nc_oc=AdrYML2ykAmp2oW7ealAClsd5IWtM7xA1YQy3ZjLWohDgf7J32UsUC3eFNA2cdSren_Y8T0nJ549vDNMLe-z84mL&_nc_zt=23&_nc_ht=scontent.fdac135-1.fna&_nc_gid=h1A5DOxHEA-tYX-YWh7LYQ&_nc_ss=7a3a8&oh=00_Afx1sjSxJn-9eMnWYoDYNIClTECgnuXBK_vHm0Jol6U2eQ&oe=69D1868C";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b shadow-sm py-2' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="font-headline text-2xl text-left border-b pb-4">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-8">
                <Link href="/" className="text-xl font-medium hover:text-primary">Home</Link>
                <Link href="/products" className="text-xl font-medium hover:text-primary">All Products</Link>
                <Link href="/products?isNewArrival=true" className="text-xl font-medium hover:text-primary">New Arrivals</Link>
                <Link href="/control-panel" className="text-xl font-medium hover:text-primary border-t pt-6">Admin Login</Link>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary/10 transition-transform group-hover:scale-105">
              <Image src={logoUrl} alt="Divine Logo" fill className="object-cover" />
            </div>
            <span className="font-headline text-xl md:text-2xl font-bold tracking-tight text-primary hidden sm:block">Divine.Co</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Home</Link>
          <Link href="/products" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Collections</Link>
          <Link href="/products?isNewArrival=true" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">New Arrivals</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex" asChild>
            <Link href="/control-panel/login"><User className="w-5 h-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full relative" asChild>
            <Link href="/checkout">
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}