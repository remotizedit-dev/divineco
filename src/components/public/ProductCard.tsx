'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, PackageX } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { AddToCartModal } from "./AddToCartModal";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  const hasFlashSale = product.isFlashSale && product.flashSaleEndTime;
  
  useEffect(() => {
    if (hasFlashSale) {
      const checkExpiry = () => {
        const now = new Date().getTime();
        const end = new Date(product.flashSaleEndTime).getTime();
        setIsExpired(now >= end);
      };
      
      checkExpiry();
      const timer = setInterval(checkExpiry, 1000);
      return () => clearInterval(timer);
    }
  }, [product.flashSaleEndTime, hasFlashSale]);

  // If flash sale is expired, we show the original price (compareAtPrice or a simulated higher value)
  const displayPrice = isExpired ? (product.compareAtPrice || product.salesPrice) : product.salesPrice;
  const originalPrice = product.compareAtPrice;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.thumbnailUrl || product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/400/500',
      quantity: 1,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-muted/20 flex flex-col h-full">
        <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] block overflow-hidden">
          <Image 
            src={product.thumbnailUrl || product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/400/500'} 
            alt={product.name} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Status Overlay */}
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-10">
              <PackageX className="w-10 h-10 mb-2 opacity-80" />
              <span className="font-headline text-xl font-bold uppercase tracking-widest">Out of Stock</span>
            </div>
          ) : (
            <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-10">
              {product.tags?.map((tag: string, idx: number) => (
                <Badge key={idx} className="bg-red-500 text-white border-none text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" /> {tag}
                </Badge>
              ))}
            </div>
          )}
        </Link>

        <div className="p-4 flex flex-col flex-1">
          <Link href={`/product/${product.slug}`} className="block mb-2">
            <h3 className="font-medium text-sm text-foreground/80 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-lg text-foreground">BDT {displayPrice}</span>
            {!isExpired && originalPrice && originalPrice > displayPrice && (
              <span className="text-xs text-muted-foreground line-through">BDT {originalPrice}</span>
            )}
          </div>

          <div className="mt-auto space-y-2">
            <Button 
              variant="outline" 
              className="w-full h-10 rounded-xl bg-muted/30 border-none text-muted-foreground hover:bg-muted/50 gap-2"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </Button>
            <Button 
              className="w-full h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 gap-2"
              asChild
              disabled={isOutOfStock}
            >
              <Link href={isOutOfStock ? '#' : `/product/${product.slug}`}>
                <Zap className="w-4 h-4 fill-current" /> Order Now
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <AddToCartModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productName={product.name}
        productPrice={displayPrice}
        productImage={product.thumbnailUrl || product.imageUrls?.[0]}
        quantity={1}
      />
    </>
  );
}
