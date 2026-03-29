
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { getCategories, searchProducts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchProducts(searchTerm).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-headline text-3xl font-bold text-primary tracking-tight">
            Divine.Co
          </Link>
          
          <div className="hidden lg:flex items-center gap-6">
            {categories.map((cat) => (
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

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4">
                <Input 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-3">
                  {searchResults.map((product) => (
                    <Link 
                      key={product.id} 
                      href={`/product/${product.slug}`}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded bg-muted overflow-hidden">
                        <Image 
                          src={product.images?.[0] || 'https://placehold.co/400x400'} 
                          alt={product.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-primary font-bold">Tk {product.price}</p>
                      </div>
                    </Link>
                  ))}
                  {searchTerm.length > 2 && searchResults.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">No products found</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t absolute w-full left-0 p-4 space-y-4 shadow-xl">
          <Input 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`} 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium py-2 border-b"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
