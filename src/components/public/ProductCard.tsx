'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { AddToCartModal } from "./AddToCartModal";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addToCart = useCartStore(state => state.addItem);
  
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;
  const isFlashSale = product.isFlashSale && product.flashSaleEndTime;

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.salesPrice,
      image: product.thumbnailUrl || product.imageUrls?.[0],
      quantity: 1
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={cn("group flex flex-col bg-white rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5", className)}>
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-muted mb-4 md:mb-6 shadow-sm">
            <Image 
              src={product.thumbnailUrl || product.imageUrls?.[0]} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            
            {/* Badges & Overlays */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.tags?.map((tag: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="bg-white/90 backdrop-blur-sm text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-3 py-1 text-foreground border-none shadow-sm">
                  {tag}
                </Badge>
              ))}
              {hasDiscount && (
                <Badge className="bg-primary text-white text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-3 py-1 border-none shadow-lg">
                  SALE
                </Badge>
              )}
            </div>

            {/* Timer Overlay */}
            {isFlashSale && (
              <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-2xl p-2 flex items-center justify-center gap-2 border border-white/50 shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <Clock className="w-3 h-3 text-primary" />
                <CountdownTimer targetDate={new Date(product.flashSaleEndTime)} className="bg-transparent text-[10px] p-0 font-bold" />
              </div>
            )}
          </div>

          <div className="px-1 space-y-2 md:space-y-3">
            <h3 className="font-headline font-bold text-base md:text-xl line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg md:text-2xl text-primary">Tk {product.salesPrice}</span>
                {hasDiscount && (
                  <span className="text-xs md:text-sm text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</span>
                )}
              </div>
              <Button 
                onClick={handleOrderNow}
                size="sm"
                className="h-10 md:h-12 px-5 md:px-7 rounded-2xl gap-2 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95 hover:scale-105"
              >
                Order Now
              </Button>
            </div>
          </div>
        </Link>
      </div>

      <AddToCartModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productName={product.name}
        productPrice={product.salesPrice}
        productImage={product.thumbnailUrl || product.imageUrls?.[0]}
        quantity={1}
      />
    </>
  );
}
