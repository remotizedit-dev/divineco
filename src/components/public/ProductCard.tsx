'use client';

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: any }) {
  // Logic to determine if a product is on sale based on variants or flags
  const isSale = product.isFlashSale === true || (product.discountedPrice && product.discountedPrice < product.salesPrice);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden">
        <Image 
          src={product.imageUrls?.[0] || product.thumbnailUrl || 'https://picsum.photos/seed/placeholder/400/500'} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {product.tags?.map((tag: string, idx: number) => (
            <Badge key={idx} className="bg-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">
              {tag}
            </Badge>
          ))}
        </div>
        {isSale && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white">
            SALE
          </Badge>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {product.categoryName || 'Collection'}
        </p>
        <Link href={`/product/${product.slug}`} className="block text-sm font-medium hover:text-primary transition-colors line-clamp-1 mb-2">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center gap-2">
          {isSale && product.discountedPrice ? (
            <>
              <span className="text-primary font-bold">Tk {product.discountedPrice}</span>
              <span className="text-muted-foreground line-through text-xs">Tk {product.salesPrice}</span>
            </>
          ) : (
            <span className="text-primary font-bold">Tk {product.salesPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
