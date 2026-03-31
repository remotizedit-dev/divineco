
'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { getProductBySlug, getProductVariants } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Truck, ShieldCheck, RefreshCw, Clock } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { AddToCartModal } from "@/components/public/AddToCartModal";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

    setIsModalOpen(true);
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

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;
  const showTimer = product.isFlashSale && product.flashSaleEndTime;

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementTicker />
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border bg-muted shadow-lg">
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
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === url ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <Image src={url} alt={`${product.name} ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {product.tags?.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="uppercase text-[10px] font-bold tracking-widest px-3 py-1">
                    {tag}
                  </Badge>
                ))}
                {hasDiscount && (
                  <Badge className="bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                    Flash Sale
                  </Badge>
                )}
              </div>
              
              <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight">{product.name}</h1>
              
              <div className="flex items-baseline gap-4">
                <p className="text-4xl font-bold text-primary">Tk {product.salesPrice}</p>
                {hasDiscount && (
                  <p className="text-xl text-muted-foreground line-through opacity-50">Tk {product.compareAtPrice}</p>
                )}
              </div>

              {showTimer && (
                <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Offers Ends In:</span>
                  </div>
                  <CountdownTimer targetDate={new Date(product.flashSaleEndTime)} className="h-10 text-lg px-4" />
                </div>
              )}
            </div>

            <div className="prose prose-sm text-muted-foreground mb-10 leading-relaxed text-lg italic">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-6 mb-10">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 block">
                    Available Variants
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stockQuantity === 0}
                        className={`px-6 py-3 rounded-2xl border-2 text-sm font-bold transition-all shadow-sm ${
                          selectedVariant?.id === v.id 
                            ? 'border-primary bg-primary text-white scale-105 shadow-primary/20' 
                            : 'border-input hover:border-primary/50'
                        } ${v.stockQuantity === 0 ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                      >
                        {v.color} - {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="flex-1 h-16 rounded-2xl text-xl gap-3 shadow-xl shadow-primary/20" onClick={handleAddToCart}>
                <ShoppingCart className="w-6 h-6" /> Order Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-dashed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider">Fast Delivery</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">24-48 Hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider">Secure COD</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Pay on Receive</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                  <RefreshCw className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider">7-Day Return</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Easy Exchanges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddToCartModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productName={product.name} 
      />
    </div>
  );
}
