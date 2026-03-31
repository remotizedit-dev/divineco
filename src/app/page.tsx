'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getProducts, getCategories } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [flash, featured, cats] = await Promise.all([
          getProducts({ isFlashSale: true, limit: 4 }),
          getProducts({ limit: 8 }),
          getCategories()
        ]);
        setFlashSaleProducts(flash || []);
        setFeaturedProducts(featured || []);
        setCategories(cats || []);
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading boutique experience...</p>
      </div>
    );
  }

  const heroImages = PlaceHolderImages && PlaceHolderImages.length >= 2 
    ? [PlaceHolderImages[0], PlaceHolderImages[1]] 
    : PlaceHolderImages && PlaceHolderImages.length > 0 ? [PlaceHolderImages[0]] : [];

  return (
    <main className="flex flex-col">
      <AnnouncementTicker />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        {heroImages.length > 0 ? (
          <Carousel className="w-full h-full" opts={{ loop: true }}>
            <CarouselContent className="h-full ml-0">
              {heroImages.map((image, index) => (
                <CarouselItem key={index} className="relative w-full h-full pl-0">
                  <Image 
                    src={image.imageUrl} 
                    alt={image.description} 
                    fill 
                    className="object-cover"
                    priority={index === 0}
                    data-ai-hint={image.imageHint}
                  />
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white text-center p-4">
                    <h1 className="font-headline text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
                      {index === 0 ? "Summer Radiance" : "Timeless Elegance"}
                    </h1>
                    <p className="text-lg md:text-xl mb-8 max-w-xl opacity-90">
                      Discover our handpicked premium collection designed for the modern woman.
                    </p>
                    <Button size="lg" className="rounded-full px-10 h-14 text-lg" asChild>
                      <Link href="/products">Shop Collection</Link>
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {heroImages.length > 1 && (
              <>
                <CarouselPrevious className="left-4 bg-white/50 border-none hover:bg-white" />
                <CarouselNext className="right-4 bg-white/50 border-none hover:bg-white" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Premium Boutique Experience</p>
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-headline font-bold">Shop by Category</h2>
          <Link href="/categories" className="text-primary font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category: any, i) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="group relative h-64 rounded-xl overflow-hidden shadow-sm"
            >
              <Image 
                src={category.image || `https://picsum.photos/seed/cat${i}/400/400`} 
                alt={category.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <p className="text-white font-headline text-xl font-bold">{category.name}</p>
              </div>
            </Link>
          ))}
          {categories.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-secondary/20 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-headline font-bold text-primary">Flash Sale</h2>
                <CountdownTimer targetDate={new Date(Date.now() + 86400000)} />
              </div>
              <Button variant="outline" className="self-start md:self-auto border-primary text-primary hover:bg-primary hover:text-white" asChild>
                <Link href="/flash-sales">View All Offers</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-headline font-bold mb-10 text-center">New Arrivals</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {featuredProducts.length === 0 && !isLoading && (
             <div className="col-span-full py-20 text-center text-muted-foreground">
                No products found.
             </div>
          )}
        </div>
      </section>

      {/* Floating CTA */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a href="#" className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      </div>
      
      <Footer />
    </main>
  );
}

function ProductCard({ product }: { product: any }) {
  const isSale = product.discountedPrice && product.discountedPrice < product.basePrice;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden">
        <Image 
          src={product.imageUrls?.[0] || product.thumbnailUrl || 'https://placehold.co/400x500'} 
          alt={product.name} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.tags?.map((tag: string, idx: number) => (
          <Badge key={idx} className="absolute bottom-3 left-3 bg-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">
            {tag}
          </Badge>
        ))}
        {isSale && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white">
            SALE
          </Badge>
        )}
      </Link>
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.categoryName}</p>
        <Link href={`/product/${product.slug}`} className="block text-sm font-medium hover:text-primary transition-colors line-clamp-1 mb-2">
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          {isSale ? (
            <>
              <span className="text-primary font-bold">Tk {product.discountedPrice}</span>
              <span className="text-muted-foreground line-through text-xs">Tk {product.basePrice}</span>
            </>
          ) : (
            <span className="text-primary font-bold">Tk {product.basePrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-muted py-16 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <h3 className="font-headline text-2xl font-bold text-primary mb-6">Divine.Co</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Crafting elegance and premium boutique experiences for the discerning modern woman since 2023.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6">Quick Links</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
            <li><Link href="/control-panel" className="hover:text-primary">Admin Panel</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Customer Service</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="/track" className="hover:text-primary">Track Order</Link></li>
            <li><Link href="/faq" className="hover:text-primary">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-4">Subscribe to receive updates and exclusive offers.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email address" className="bg-white border rounded-md px-4 py-2 text-sm flex-1 outline-none focus:ring-1 focus:ring-primary" />
            <Button size="sm">Join</Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t text-center text-xs text-muted-foreground">
        © 2024 Divine.Co Boutique. All rights reserved.
      </div>
    </footer>
  );
}
