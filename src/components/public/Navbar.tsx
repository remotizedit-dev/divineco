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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/lib/store";

export function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-white py-4"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          
          {/* Mobile Menu Trigger */}
          <button className="lg:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary/10 shadow-sm transition-transform group-hover:scale-105">
              <Image src={logoUrl} alt="Divine.Co Logo" fill className="object-cover" />
            </div>
            <span className="font-headline text-xl md:text-3xl font-bold text-primary tracking-tight">Divine.Co</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Home</Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors outline-none">
                Collections <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-xl border-none">
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 font-bold">
                  <Link href="/products">All Collections</Link>
                </DropdownMenuItem>
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild className="rounded-xl cursor-pointer py-3 font-medium">
                    <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/#new-arrivals" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">New Arrivals</Link>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 md:gap-6">
            <button className="p-2 hover:bg-muted rounded-full transition-colors hidden sm:block">
              <Search className="w-5 h-5 text-foreground" />
            </button>
            <CartSheet />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b shadow-2xl p-6 animate-in slide-in-from-top duration-300">
          <ul className="space-y-6">
            <li><Link href="/" className="block text-lg font-bold" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
            <li><Link href="/products" className="block text-lg font-bold" onClick={() => setIsMobileMenuOpen(false)}>All Products</Link></li>
            <li className="space-y-4 pt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</p>
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/category/${cat.slug}`} 
                  className="block text-sm font-medium hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
