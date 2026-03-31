'use client';

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store";
import { useState } from "react";
import { AddToCartModal } from "./AddToCartModal";
import { CountdownTimer } from "@/components/ui/countdown-timer";

export function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore(state => state.addItem);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;
  const isFlashSale = product.isFlashSale && product.flashSaleEndTime;

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.salesPrice,
      image: product.thumbnailUrl,
      quantity: 1,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-muted h-full">
      {/* Image Section */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        <Image 
          src={product.thumbnailUrl || 'https://picsum.photos/seed/placeholder/400/500'} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.tags?.includes("New Arrival") && (
            <Badge className="bg-primary text-white font-bold uppercase text-[9px] tracking-widest px-2 py-0.5">
              New Arrival
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-green-600 text-white font-bold uppercase text-[9px] tracking-widest px-2 py-0.5">
              Save Tk {product.compareAtPrice - product.salesPrice}
            </Badge>
          )}
        </div>

        {/* Hover Overlay with View Icon */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Eye className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Timer Overlay */}
        {isFlashSale && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-primary/90 text-white backdrop-blur-sm">
             <div className="flex items-center justify-center gap-2">
               <Clock className="w-3 h-3" />
               <CountdownTimer 
                 targetDate={new Date(product.flashSaleEndTime)} 
                 className="bg-transparent text-white border-none p-0 h-auto text-[10px]" 
               />
             </div>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="flex-1">
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">
            Premium Collection
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">Tk {product.salesPrice}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through opacity-60 font-medium">
              Tk {product.compareAtPrice}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2 pt-2">
          <Button 
            className="w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wider gap-2 shadow-sm" 
            onClick={handleOrderNow}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Order Now
          </Button>
          <Button 
            asChild 
            variant="outline" 
            className="w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wider border-primary/20 hover:bg-primary/5"
          >
            <Link href={`/product/${product.slug}`}>View Item</Link>
          </Button>
        </div>
      </div>

      <AddToCartModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productName={product.name} 
      />
    </div>
  );
}
