'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/badge";
import { ShoppingCart, Clock } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useState } from "react";
import { AddToCartModal } from "./AddToCartModal";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.salesPrice,
      image: product.thumbnailUrl || product.imageUrls?.[0],
      quantity: 1,
    });
    setIsModalOpen(true);
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;
  const showTimer = product.isFlashSale && product.flashSaleEndTime;

  return (
    <>
      <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/10">
        <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
          <Image 
            src={product.thumbnailUrl || product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/400/500'} 
            alt={product.name} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          
          {/* Badge Overlays */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.tags?.includes("New Arrival") && (
              <span className="bg-white/90 backdrop-blur-sm text-foreground text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                Sale
              </span>
            )}
          </div>

          {/* Floating Timer */}
          {showTimer && (
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-2 flex items-center justify-between shadow-lg border border-white/20">
                <div className="flex items-center gap-1.5 text-primary">
                  <Clock className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Ends:</span>
                </div>
                <CountdownTimer 
                  targetDate={new Date(product.flashSaleEndTime)} 
                  className="bg-transparent px-0 py-0 text-[10px] text-primary" 
                />
              </div>
            </div>
          )}
        </Link>

        <div className="p-4 flex flex-col flex-1">
          <Link href={`/product/${product.slug}`} className="mb-2">
            <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">Tk {product.salesPrice}</span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</span>
              )}
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full bg-foreground text-white hover:bg-primary transition-colors h-11 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Order Now
            </button>
          </div>
        </div>
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
