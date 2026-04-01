'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, PackageX } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isExpired, setIsExpired] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (product.isFlashSale && product.flashSaleEndTime) {
      const checkExpiry = () => {
        const now = new Date().getTime();
        const end = new Date(product.flashSaleEndTime).getTime();
        if (now >= end) {
          setIsExpired(true);
        }
      };
      
      checkExpiry();
      const interval = setInterval(checkExpiry, 1000);
      return () => clearInterval(interval);
    }
  }, [product.flashSaleEndTime, product.isFlashSale]);

  const hasActiveSale = product.isFlashSale && !isExpired;
  const displayPrice = hasActiveSale ? product.salesPrice : (product.compareAtPrice || product.salesPrice);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.thumbnailUrl,
      quantity: 1,
    });
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasActiveSale && (
              <Badge className="bg-red-500 text-white font-bold uppercase tracking-wider text-[10px] px-3 py-1 shadow-lg">
                <Zap className="w-3 h-3 fill-current mr-1" /> Flash Sale
              </Badge>
            )}
            {product.tags?.includes("New Arrival") && (
              <Badge className="bg-primary text-white font-bold uppercase tracking-wider text-[10px] px-3 py-1 shadow-lg">
                New
              </Badge>
            )}
          </div>

          {/* Countdown Overlay on Image */}
          {hasActiveSale && product.flashSaleEndTime && (
            <div className="absolute bottom-4 left-4 right-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <CountdownTimer 
                targetDate={new Date(product.flashSaleEndTime)} 
                className="w-full justify-center bg-white/90 backdrop-blur-md border-none shadow-xl text-red-600 h-10 rounded-2xl text-base"
              />
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-white/90 px-6 py-2 rounded-full shadow-2xl transform -rotate-12 border-2 border-red-500">
                <p className="text-red-600 font-headline font-bold uppercase tracking-widest text-sm">Out of Stock</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-headline text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-xl font-bold text-primary">Tk {displayPrice}</span>
            {hasActiveSale && product.compareAtPrice && product.compareAtPrice > product.salesPrice && (
              <span className="text-sm text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-xl h-10 gap-1 text-[10px] uppercase tracking-widest font-bold"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-3 h-3" /> Add
            </Button>
            <Button 
              size="sm" 
              className="rounded-xl h-10 gap-1 text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20"
              disabled={isOutOfStock}
            >
              <Zap className="w-3 h-3 fill-current" /> Buy
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}