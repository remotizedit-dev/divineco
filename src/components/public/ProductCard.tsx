
'use client';

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, ShoppingCart } from "lucide-react";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { useCartStore } from "@/lib/store";
import { useState } from "react";
import { AddToCartModal } from "./AddToCartModal";

export function ProductCard({ product }: { product: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;
  const showTimer = product.isFlashSale && product.flashSaleEndTime;

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <>
      <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/10">
        <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
          <Image 
            src={product.thumbnailUrl || 'https://picsum.photos/seed/placeholder/400/500'} 
            alt={product.name} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.tags?.includes("New Arrival") && (
              <Badge className="bg-white text-primary border-none font-bold uppercase text-[9px] px-2 py-0.5 shadow-sm">
                New
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-primary text-white border-none font-bold uppercase text-[9px] px-2 py-0.5 shadow-sm">
                Sale
              </Badge>
            )}
          </div>

          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        </Link>

        <div className="p-4 flex flex-col flex-1">
          {showTimer && (
            <div className="mb-3">
              <CountdownTimer 
                targetDate={new Date(product.flashSaleEndTime)} 
                className="text-[10px] py-0.5 justify-center w-full"
              />
            </div>
          )}
          
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto pt-2 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-primary font-bold text-lg">Tk {product.salesPrice}</span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</span>
              )}
            </div>

            <Button 
              onClick={handleOrderNow}
              className="w-full rounded-xl h-10 gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Order Now
            </Button>
          </div>
        </div>
      </div>

      <AddToCartModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productName={product.name} 
      />
    </>
  );
}
