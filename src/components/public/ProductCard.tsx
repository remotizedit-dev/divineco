'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useState } from "react";
import { AddToCartModal } from "./AddToCartModal";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
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

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;

  return (
    <>
      <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-primary/5">
        <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
          <Image 
            src={product.thumbnailUrl || 'https://picsum.photos/seed/placeholder/400/500'} 
            alt={product.name} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.tags?.includes("New Arrival") && (
              <Badge className="bg-white/90 text-primary border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1 backdrop-blur-sm">New</Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-primary text-white border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1">Sale</Badge>
            )}
          </div>
        </Link>
        
        <div className="p-5 flex flex-col items-center text-center">
          <Link href={`/product/${product.slug}`} className="block w-full">
            <h3 className="font-headline font-bold text-lg mb-2 text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xl font-bold text-primary">Tk {product.salesPrice}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</span>
            )}
          </div>

          <Button 
            onClick={handleAddToCart}
            className="w-full h-12 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/10"
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
