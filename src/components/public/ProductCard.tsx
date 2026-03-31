'use client';

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye, Clock } from "lucide-react";
import { useState } from "react";
import { AddToCartModal } from "./AddToCartModal";
import { CountdownTimer } from "@/components/ui/countdown-timer";

export function ProductCard({ product }: { product: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
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

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;
  const showTimer = product.isFlashSale && product.flashSaleEndTime;

  return (
    <>
      <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-primary/5">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Link href={`/product/${product.slug}`} className="block h-full">
            <Image 
              src={product.thumbnailUrl || 'https://picsum.photos/seed/placeholder/400/500'} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>

          {/* Overlays */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.tags?.includes("New Arrival") && (
              <Badge className="bg-white/90 text-primary font-bold uppercase text-[9px] px-3 py-1 backdrop-blur-sm border-none shadow-sm tracking-widest">
                New
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-primary text-white font-bold uppercase text-[9px] px-3 py-1 border-none shadow-sm tracking-widest">
                Sale
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Button size="icon" className="w-12 h-12 rounded-full bg-white text-primary hover:bg-primary hover:text-white shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300" asChild>
              <Link href={`/product/${product.slug}`}><Eye className="w-5 h-5" /></Link>
            </Button>
            <Button size="icon" className="w-12 h-12 rounded-full bg-primary text-white hover:bg-white hover:text-primary shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75" onClick={handleAddToCart}>
              <ShoppingBag className="w-5 h-5" />
            </Button>
          </div>

          {showTimer && (
            <div className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-lg flex items-center justify-between gap-2 border border-primary/10">
                <span className="text-[8px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Ends In:
                </span>
                <CountdownTimer targetDate={new Date(product.flashSaleEndTime)} className="h-6 text-[10px] px-2" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 text-center">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-bold text-sm tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-lg font-bold text-primary">Tk {product.salesPrice}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</span>
            )}
          </div>
          <Button 
            className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-widest gap-2 shadow-lg shadow-primary/5"
            onClick={handleAddToCart}
          >
            Order Now
          </Button>
        </div>
      </div>

      <AddToCartModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productName={product.name}
        productPrice={product.salesPrice}
        productImage={product.thumbnailUrl}
        quantity={1}
      />
    </>
  );
}