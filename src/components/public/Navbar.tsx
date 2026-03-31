'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, ChevronDown, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { getCategories } from "@/lib/api";
import { useFirestore } from "@/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
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
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
              <Image src={logoUrl} alt="Divine.Co Logo" fill className="object-cover" />
            </div>
            <span className="font-headline text-xl md:text-2xl font-bold tracking-tight text-primary">Divine.Co</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link href="/products" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
              All Shoes
            </Link>
            <Link href="/#new-arrivals" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
              New Arrivals
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors outline-none">
                Categories <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl border-none shadow-xl">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild>
                    <Link href={`/category/${cat.slug}`} className="w-full cursor-pointer rounded-lg py-2.5 font-medium">
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full">
            <Search className="w-5 h-5" />
          </Button>
          
          <Link href="/checkout" className="relative p-2 hover:bg-muted rounded-full transition-colors">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full text-[10px] font-bold">
                {cartCount}
              </Badge>
            )}
          </Link>

          <Button variant="outline" size="sm" className="hidden md:flex rounded-full gap-2 border-primary/20 text-primary" asChild>
            <Link href="/control-panel/login">
              <User className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 border-none">
              <SheetHeader className="p-6 border-b text-left">
                <SheetTitle className="font-headline text-2xl font-bold text-primary">Divine.Co</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-6 gap-6">
                <Link href="/products" className="text-lg font-bold">All Shoes</Link>
                <Link href="/#new-arrivals" className="text-lg font-bold">New Arrivals</Link>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Categories</p>
                  <div className="grid grid-cols-1 gap-3">
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/category/${cat.slug}`} className="text-base font-medium hover:text-primary">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
