'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Clock } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { CountdownTimer } from "@/components/ui/countdown-timer";

export function ProductCard({ product }: { product: any }) {
  const [isExpired, setIsExpired] = useState(false);
  const addItem = useCartStore(state => state.addItem);

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
      const timer = setInterval(checkExpiry, 1000);
      return () => clearInterval(timer);
    }
  }, [product.flashSaleEndTime, product.isFlashSale]);

  const hasFlashSale = product.isFlashSale && product.flashSaleEndTime && !isExpired;
  const currentPrice = hasFlashSale ? product.salesPrice : (product.compareAtPrice || product.salesPrice);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.thumbnailUrl,
      quantity: 1
    });
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-muted shadow-sm hover:shadow-xl transition-all duration-500 h-full">
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden">
        <Image 
          src={product.thumbnailUrl} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {hasFlashSale && (
            <Badge className="bg-red-500 text-white border-none font-bold uppercase tracking-wider text-[10px] px-2 py-1 flex items-center gap-1 shadow-lg">
              <Zap className="w-3 h-3 fill-current" /> Flash Sale
            </Badge>
          )}
          {product.tags?.includes("New Arrival") && (
            <Badge className="bg-primary text-white border-none font-bold uppercase tracking-wider text-[10px] px-2 py-1 shadow-lg">
              New Arrival
            </Badge>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover Action (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent hidden md:block">
          <Button 
            className="w-full rounded-full font-bold uppercase tracking-widest text-[10px] h-10 shadow-xl"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            Add to Bag
          </Button>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="font-headline text-lg font-bold truncate group-hover:text-primary transition-colors">{product.name}</h3>
        </div>

        {/* Countdown Timer for Card */}
        {hasFlashSale && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-red-500 mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Ends In:</span>
            </div>
            <CountdownTimer 
              targetDate={new Date(product.flashSaleEndTime)} 
              className="h-7 text-[10px] bg-red-50 text-red-600 border-none px-2 shadow-none"
            />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">Tk {currentPrice}</span>
            {hasFlashSale && product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</span>
            )}
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full hover:bg-primary/10 hover:text-primary md:hidden"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}