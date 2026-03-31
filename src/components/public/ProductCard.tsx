
'use client';

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Clock } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { useState } from "react";
import { AddToCartModal } from "./AddToCartModal";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.salesPrice,
      image: product.thumbnailUrl,
      quantity: 1
    });

    setIsModalOpen(true);
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;
  const showTimer = product.isFlashSale && product.flashSaleEndTime;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden">
        <Image 
          src={product.thumbnailUrl || 'https://picsum.photos/seed/placeholder/400/500'} 
          alt={product.name} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.tags?.map((tag: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="uppercase text-[9px] font-bold tracking-widest bg-white/90 backdrop-blur-sm text-primary border-none shadow-sm">
              {tag}
            </Badge>
          ))}
          {hasDiscount && (
            <Badge className="bg-primary text-white text-[9px] font-bold border-none shadow-sm">
              -{Math.round((1 - product.salesPrice / product.compareAtPrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button size="icon" variant="secondary" className="rounded-full shadow-lg" asChild>
            <Link href={`/product/${product.slug}`}>
              <Eye className="w-5 h-5" />
            </Link>
          </Button>
          <Button size="icon" className="rounded-full shadow-lg" onClick={handleAddToCart}>
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>

        {/* Flash Sale Timer */}
        {showTimer && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-tighter text-primary flex items-center gap-1">
                <Clock className="w-3 h-3" /> Ends In:
              </span>
              <CountdownTimer targetDate={new Date(product.flashSaleEndTime)} className="text-[10px] h-6" />
            </div>
          </div>
        )}
      </Link>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-headline text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-primary font-bold">Tk {product.salesPrice}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through opacity-70">Tk {product.compareAtPrice}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full h-10 text-xs gap-1 border-primary/20 hover:border-primary hover:bg-primary/5" asChild>
            <Link href={`/product/${product.slug}`}>View Details</Link>
          </Button>
          <Button className="flex-1 rounded-full h-10 text-xs gap-1 shadow-lg shadow-primary/20" onClick={handleAddToCart}>
            <ShoppingCart className="w-3.5 h-3.5" /> Add to Bag
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
