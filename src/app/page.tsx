'use client';

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/public/ProductCard";
import { useFirestore } from "@/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const firestore = useFirestore();

  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  useEffect(() => {
    async function fetchData() {
      if (!firestore) return;
      try {
        const bannersSnap = await getDocs(query(collection(firestore, "homepageBanners"), orderBy("displayOrder", "asc")));
        const fetchedBanners = bannersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((b: any) => b.isActive !== false);
        setBanners(fetchedBanners);

        const [flash, arrivals, all] = await Promise.all([
          getProducts({ isFlashSale: true, limit: 4 }),
          getProducts({ isNewArrival: true, limit: 8 }),
          getProducts({ limit: 12 })
        ]);
        
        setFlashSaleProducts(flash || []);
        setNewArrivals(arrivals || []);
        setAllProducts(all || []);
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [firestore]);

  const loadMoreProducts = async () => {
    setIsLoadingMore(true);
    try {
      const more = await getProducts({ limit: 24 });
      setAllProducts(more);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <AnnouncementTicker />
      <Navbar />
      
      {/* Hero Section - Fixed height to avoid layout shift */}
      <section className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden bg-muted/10">
        {banners.length > 0 ? (
          <Carousel 
            className="w-full h-full" 
            opts={{ loop: true }}
            plugins={[autoplay.current]}
          >
            <CarouselContent className="h-full ml-0">
              {banners.map((banner, index) => (
                <CarouselItem key={banner.id} className="relative w-full h-full pl-0">
                  <div className="relative w-full h-full">
                    <Image 
                      src={banner.imageUrl} 
                      alt={banner.title || "Premium Footwear Banner"} 
                      fill 
                      className="object-cover"
                      priority={index === 0}
                    />
                    {(banner.title || banner.description) && (
                      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center p-6">
                        {banner.title && (
                          <h1 className="font-headline text-4xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 drop-shadow-xl max-w-5xl tracking-tight leading-[1.1]">
                            {banner.title}
                          </h1>
                        )}
                        {banner.description && (
                          <p className="text-base md:text-2xl mb-8 md:mb-12 max-w-2xl opacity-90 font-light italic leading-relaxed">
                            {banner.description}
                          </p>
                        )}
                        <Button size="lg" className="rounded-full px-10 md:px-14 h-14 md:h-16 text-lg md:text-xl shadow-2xl transition-all hover:scale-105 bg-white text-primary hover:bg-white/90 border-none" asChild>
                          <Link href={banner.targetUrl || "/products"}>Explore Collection</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
            ) : (
              <>
                <h1 className="font-headline text-4xl md:text-6xl font-bold mb-4">Divine.Co</h1>
                <p className="text-muted-foreground max-w-md">Premium steps for every occasion.</p>
              </>
            )}
          </div>
        )}
      </section>

      <section id="new-arrivals" className="container mx-auto px-4 py-16 md:py-24 scroll-mt-20">
        <div className="flex flex-col items-center mb-10 md:mb-16 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-bold">Latest Drops</Badge>
          <h2 className="text-3xl md:text-5xl font-headline font-bold mb-4 tracking-tight">New Arrivals</h2>
          <div className="w-20 h-1 bg-primary rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10">
          {newArrivals.length > 0 ? (
            newArrivals.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            isLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-2xl" />
            ))
          )}
        </div>
      </section>

      {flashSaleProducts.length > 0 && (
        <section className="bg-primary/[0.02] py-16 md:py-24 border-y border-primary/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 md:mb-16">
              <div>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-2 tracking-tight">Flash Offers</h2>
                <p className="text-muted-foreground italic text-sm">Elevate your style with exclusive deals.</p>
              </div>
              <Button variant="outline" className="self-start md:self-auto border-primary text-primary hover:bg-primary hover:text-white rounded-full px-10 h-12 md:h-14 font-bold transition-all" asChild>
                <Link href="/products?sale=true">View All Deals</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10">
              {flashSaleProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center mb-10 md:mb-16 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-bold">Curated Collections</Badge>
          <h2 className="text-3xl md:text-5xl font-headline font-bold mb-4 tracking-tight">Full Gallery</h2>
          <div className="w-20 h-1 bg-primary rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10">
          {allProducts.length > 0 ? (
            allProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
             isLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-2xl" />
            ))
          )}
        </div>

        {allProducts.length > 0 && (
          <div className="mt-16 md:mt-20 flex justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-12 md:px-20 h-14 md:h-16 text-lg md:text-xl border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/5 font-bold"
              onClick={loadMoreProducts}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : "Load More Experience"}
            </Button>
          </div>
        )}
      </section>
      
      <Footer />
    </main>
  );
}

function Footer() {
  const logoUrl = "https://scontent.fdac135-1.fna.fbcdn.net/v/t39.30808-6/628435890_122197311278360003_8388629514506424761_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeFHbPqMNMzeFabHnjPiUzvbas5aCNVn-kRqzloI1Wf6RHybfOk8Ngj71yZCJhpj75lVDwtqEovNxe0-O8o3FXav&_nc_ohc=u3Kitqoz264Q7kNvwGcn208&_nc_oc=AdrYML2ykAmp2oW7ealAClsd5IWtM7xA1YQy3ZjLWohDgf7J32UsUC3eFNA2cdSren_Y8T0nJ549vDNMLe-z84mL&_nc_zt=23&_nc_ht=scontent.fdac135-1.fna&_nc_gid=h1A5DOxHEA-tYX-YWh7LYQ&_nc_ss=7a3a8&oh=00_Afx1sjSxJn-9eMnWYoDYNIClTECgnuXBK_vHm0Jol6U2eQ&oe=69D1868C";

  return (
    <footer className="bg-white py-16 md:py-24 mt-12 border-t">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
        <div className="col-span-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10 shadow-sm">
              <Image src={logoUrl} alt="Divine.Co Logo" fill className="object-cover" />
            </div>
            <h3 className="font-headline text-2xl font-bold text-primary">Divine.Co</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-8">
            The destination for premium footwear. We combine craftsmanship with contemporary design for every step of your journey.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="w-11 h-11 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="w-11 h-11 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
              <Instagram className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-foreground">Shop</h4>
          <ul className="space-y-4 text-sm text-muted-foreground font-medium">
            <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
            <li><Link href="/#new-arrivals" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            <li><Link href="/checkout" className="hover:text-primary transition-colors">My Shopping Bag</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-foreground">Support</h4>
          <ul className="space-y-4 text-sm text-muted-foreground font-medium">
            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +880 1XXX-XXXXXX</li>
            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> info@divine.co</li>
            <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-primary mt-0.5" /> Dhaka, Bangladesh</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-foreground">Newsletter</h4>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Be the first to know about new arrivals and exclusive limited-time offers.</p>
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-muted/30 border-none rounded-xl px-5 py-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner" 
            />
            <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">Subscribe Now</Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 md:mt-24 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
        <span>© 2024 Divine.Co Premium Shoe Store</span>
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          <span>Premium Quality</span>
          <span>Fast Delivery</span>
          <span>Verified Payments</span>
        </div>
      </div>
    </footer>
  );
}
