'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getProducts, getCategories } from "@/lib/api";
import { ProductCard } from "@/components/public/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [flash, arrivals, cats] = await Promise.all([
          getProducts({ isFlashSale: true, limit: 4 }),
          getProducts({ isNewArrival: true, limit: 8 }),
          getCategories()
        ]);
        setFlashSaleProducts(flash || []);
        setNewArrivals(arrivals || []);
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
          <Link href="/products" className="text-primary font-medium flex items-center gap-1 hover:underline">
            View All Products <ChevronRight className="w-4 h-4" />
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
                <Link href="/products?sale=true">View All Offers</Link>
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

      {/* New Arrivals Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-headline font-bold mb-10 text-center">New Arrivals</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {newArrivals.length === 0 && !isLoading && (
             <div className="col-span-full py-20 text-center text-muted-foreground">
                No new arrivals at the moment.
             </div>
          )}
        </div>
      </section>
      
      <Footer />
    </main>
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
            <li><Link href="/products" className="hover:text-primary">Our Collections</Link></li>
            <li><Link href="/control-panel" className="hover:text-primary">Admin Panel</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Customer Service</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-primary">Track Order</Link></li>
            <li><Link href="#" className="hover:text-primary">FAQs</Link></li>
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
