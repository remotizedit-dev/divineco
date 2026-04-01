'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';

export function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore(state => state.addItem);

  const isOutOfStock = product.stock <= 0;
  
  return (
    <div className="group bg-white rounded-2xl border border-muted-foreground/10 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-muted overflow-hidden">
        <Image 
          src={product.thumbnailUrl} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
            <span className="text-white font-headline font-bold text-sm uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}
        {product.isFlashSale && !isOutOfStock && (
          <Badge className="absolute top-4 left-4 bg-red-500 text-white font-bold text-[10px] uppercase px-3 py-1">
            Flash Sale
          </Badge>
        )}
      </Link>
      
      <div className="p-4 space-y-3">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-headline font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-primary">Tk {product.salesPrice}</span>
            {product.compareAtPrice && product.compareAtPrice > product.salesPrice && (
              <span className="text-xs text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</span>
            )}
          </div>
        </Link>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-10 gap-1 border-muted-foreground/20 text-[10px] font-bold uppercase tracking-widest"
            disabled={isOutOfStock}
            onClick={() => addToCart({
              id: product.id,
              name: product.name,
              price: product.salesPrice,
              image: product.thumbnailUrl,
              quantity: 1
            })}
          >
            <ShoppingCart className="w-3 h-3" /> Bag
          </Button>
          <Button 
            size="sm" 
            className="rounded-xl h-10 gap-1 text-[10px] font-bold uppercase tracking-widest"
            asChild
            disabled={isOutOfStock}
          >
            <Link href={`/product/${product.slug}`}>
               <Zap className="w-3 h-3 fill-current" /> Order
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
