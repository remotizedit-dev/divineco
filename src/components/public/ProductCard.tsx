
'use client';

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: any }) {
  // Use salesPrice since we updated the schema to have costPrice/salesPrice
  const displayPrice = product.salesPrice || 0;
  const isSale = product.isFlashSale || (product.discountedPrice && product.discountedPrice < displayPrice);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.categoryName || 'Boutique'}</p>
        <Link href={`/product/${product.slug}`} className="block text-sm font-medium hover:text-primary transition-colors line-clamp-1 mb-2">
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          {isSale && product.discountedPrice ? (
            <>
              <span className="text-primary font-bold">Tk {product.discountedPrice}</span>
              <span className="text-muted-foreground line-through text-xs">Tk {displayPrice}</span>
            </>
          ) : (
            <span className="text-primary font-bold">Tk {displayPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
