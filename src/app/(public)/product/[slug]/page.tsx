'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { getProductBySlug, getProductVariants } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Truck, ShieldCheck, RefreshCw, Clock, Zap, PackageX } from "lucide-react";
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
  const [isExpired, setIsExpired] = useState(false);
  
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

  useEffect(() => {
    if (product?.isFlashSale && product?.flashSaleEndTime) {
      const checkExpiry = () => {
        const now = new Date().getTime();
        const end = new Date(product.flashSaleEndTime).getTime();
        if (now >= end && !isExpired) {
          setIsExpired(true);
        }
      };
      checkExpiry();
      const timer = setInterval(checkExpiry, 1000);
      return () => clearInterval(timer);
    }
  }, [product, isExpired]);

  const hasActiveSale = product?.isFlashSale && !isExpired;
  const displayPrice = hasActiveSale ? product?.salesPrice : (product?.compareAtPrice || product?.salesPrice);
  const isOutOfStock = product?.stock <= 0;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementTicker />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-primary/5 bg-muted shadow-2xl">
              <Image 
                src={activeImage} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-6 text-center">
                  <PackageX className="w-16 h-16 mb-4 opacity-70" />
                  <h2 className="text-3xl font-headline font-bold uppercase tracking-widest">Out of Stock</h2>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {product.imageUrls?.map((url: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(url)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${activeImage === url ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={url} alt={`${product.name} ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col py-4">
            <div className="mb-8 space-y-4">
              <div className="flex flex-wrap gap-2">
                {product.tags?.map((tag: string, idx: number) => (
                  <Badge key={idx} className="bg-red-500 text-white font-bold uppercase tracking-wider text-[10px] px-3 py-1">
                    <Zap className="w-3 h-3 fill-current mr-1" /> {tag}
                  </Badge>
                ))}
                {hasActiveSale && (
                  <Badge className="bg-amber-500 text-white font-bold uppercase tracking-wider text-[10px] px-3 py-1">
                    Flash Sale
                  </Badge>
                )}
              </div>
              
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">{product.name}</h1>
              
              <div className="flex items-baseline gap-6">
                <p className="text-4xl md:text-5xl font-bold text-primary">BDT {displayPrice}</p>
                {hasActiveSale && product.compareAtPrice && product.compareAtPrice > product.salesPrice && (
                  <p className="text-xl md:text-2xl text-muted-foreground line-through opacity-40 font-medium">BDT {product.compareAtPrice}</p>
                )}
              </div>

              {hasActiveSale && product.flashSaleEndTime && (
                <div className="flex items-center gap-4 md:gap-6 bg-red-50 border border-red-100 rounded-2xl p-4 md:p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-red-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Ends In:</span>
                  </div>
                  <CountdownTimer 
                    targetDate={new Date(product.flashSaleEndTime)} 
                    className="h-10 text-xl px-4 rounded-xl shadow-inner bg-white border-none text-red-600" 
                  />
                </div>
              )}
            </div>

            <div className="text-muted-foreground mb-8 leading-relaxed text-lg italic font-light max-w-xl">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-6 mb-10">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 block">
                  Select Variant
                </label>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stockQuantity === 0}
                      className={`px-6 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        selectedVariant?.id === v.id 
                          ? 'border-primary bg-primary text-white scale-105 shadow-lg shadow-primary/20' 
                          : 'border-muted bg-muted/30 hover:border-primary/50'
                      } ${v.stockQuantity === 0 ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                    >
                      {v.color} - {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-12">
              <Button 
                size="lg" 
                variant="outline"
                className="h-16 rounded-2xl text-xl gap-3 border-2" 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-6 h-6" /> Add to Cart
              </Button>
              <Button 
                size="lg" 
                className="h-16 rounded-2xl text-xl gap-3 bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20" 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <Zap className="w-6 h-6 fill-current" /> Order Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-dashed border-muted">
              <div className="flex items-center sm:flex-col sm:items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest">Fast Delivery</p>
                  <p className="text-[10px] text-muted-foreground mt-1">24-48 Hours</p>
                </div>
              </div>
              <div className="flex items-center sm:flex-col sm:items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest">Secure COD</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Pay on Receive</p>
                </div>
              </div>
              <div className="flex items-center sm:flex-col sm:items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest">Easy Returns</p>
                  <p className="text-[10px] text-muted-foreground mt-1">7-Day Guarantee</p>
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
        productPrice={displayPrice}
        productImage={activeImage}
        quantity={1}
      />
    </div>
  );
}