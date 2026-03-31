
'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { getProductBySlug, getProductVariants } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const addToCart = useCartStore(state => state.addItem);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const prod = await getProductBySlug(slug as string);
        if (prod) {
          setProduct(prod);
          setActiveImage(prod.imageUrls?.[0] || prod.thumbnailUrl);
          const vars = await getProductVariants(prod.id);
          setVariants(vars);
          if (vars.length > 0) setSelectedVariant(vars[0]);
        }
      } catch (error) {
        console.error("Failed to load product details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.salesPrice,
      image: activeImage,
      quantity: 1,
      variant: selectedVariant ? { color: selectedVariant.color, size: selectedVariant.size } : undefined
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your bag.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementTicker />
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border bg-muted">
              <Image 
                src={activeImage} 
                alt={product.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.imageUrls?.map((url: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === url ? 'border-primary' : 'border-transparent'}`}
                >
                  <Image src={url} alt={`${product.name} ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags?.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="uppercase text-[10px] font-bold">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="font-headline text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-primary">Tk {product.salesPrice}</p>
            </div>

            <div className="prose prose-sm text-muted-foreground mb-8">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-sm font-bold uppercase tracking-wider mb-3 block">
                    Select Option
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stockQuantity === 0}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedVariant?.id === v.id 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-input hover:border-primary'
                        } ${v.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {v.color} - {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button size="lg" className="flex-1 h-14 rounded-full text-lg gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5" /> Add to Bag
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">Within 2-3 days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">COD Available</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">7 Days Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
