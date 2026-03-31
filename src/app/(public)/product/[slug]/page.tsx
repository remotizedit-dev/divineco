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
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <p className="text-muted-foreground font-headline text-xl">Product not found.</p>
        </div>
      </div>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.salesPrice;
  const showTimer = product.isFlashSale && product.flashSaleEndTime;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementTicker />
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-primary/5 bg-muted shadow-2xl">
              <Image 
                src={activeImage} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.imageUrls?.map((url: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(url)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === url ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={url} alt={`${product.name} ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col py-4">
            <div className="mb-10 space-y-6">
              <div className="flex flex-wrap gap-2">
                {product.tags?.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="uppercase text-[10px] font-bold tracking-[0.2em] px-4 py-1.5 bg-muted/50 border-none">
                    {tag}
                  </Badge>
                ))}
                {hasDiscount && (
                  <Badge className="bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 border-none shadow-md">
                    Flash Offer
                  </Badge>
                )}
              </div>
              
              <h1 className="font-headline text-5xl md:text-6xl font-bold leading-tight tracking-tight">{product.name}</h1>
              
              <div className="flex items-baseline gap-6">
                <p className="text-5xl font-bold text-primary">Tk {product.salesPrice}</p>
                {hasDiscount && (
                  <p className="text-2xl text-muted-foreground line-through opacity-40 font-medium">Tk {product.compareAtPrice}</p>
                )}
              </div>

              {showTimer && (
                <div className="flex items-center gap-6 bg-primary/5 border border-primary/10 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 text-primary">
                    <Clock className="w-6 h-6" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Offer Ends In:</span>
                  </div>
                  <CountdownTimer targetDate={new Date(product.flashSaleEndTime)} className="h-12 text-2xl px-6 rounded-2xl shadow-inner bg-white border-none" />
                </div>
              )}
            </div>

            <div className="prose prose-sm text-muted-foreground mb-12 leading-relaxed text-xl italic font-light max-w-xl">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-8 mb-12">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6 block">
                    Select Your Size & Color
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stockQuantity === 0}
                        className={`px-8 py-4 rounded-2xl border-2 text-sm font-bold transition-all shadow-sm ${
                          selectedVariant?.id === v.id 
                            ? 'border-primary bg-primary text-white scale-105 shadow-xl shadow-primary/20' 
                            : 'border-muted bg-muted/30 hover:border-primary/50'
                        } ${v.stockQuantity === 0 ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                      >
                        {v.color} - {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <Button size="lg" className="flex-1 h-20 rounded-3xl text-2xl gap-4 shadow-2xl shadow-primary/20 transition-all active:scale-95" onClick={handleAddToCart}>
                <ShoppingCart className="w-7 h-7" /> Order Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-12 border-t border-dashed border-muted">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                <div className="w-16 h-16 rounded-[1.25rem] bg-muted/50 flex items-center justify-center shadow-inner group">
                  <Truck className="w-8 h-8 text-primary transition-transform group-hover:-translate-y-1" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest">Fast Delivery</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">24-48 Hours</p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                <div className="w-16 h-16 rounded-[1.25rem] bg-muted/50 flex items-center justify-center shadow-inner group">
                  <ShieldCheck className="w-8 h-8 text-primary transition-transform group-hover:-translate-y-1" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest">Secure COD</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Pay on Receive</p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                <div className="w-16 h-16 rounded-[1.25rem] bg-muted/50 flex items-center justify-center shadow-inner group">
                  <RefreshCw className="w-8 h-8 text-primary transition-transform group-hover:-translate-y-1" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest">Easy Returns</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">7-Day Guarantee</p>
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
        productPrice={product.salesPrice}
        productImage={activeImage}
        quantity={1}
      />
    </div>
  );
}
