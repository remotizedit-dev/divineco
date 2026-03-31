
'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Button } from "@/components/ui/button";
import { getProducts, getCategories } from "@/lib/api";
import { ProductCard } from "@/components/public/ProductCard";
import { useFirestore } from "@/firebase";
import { collection, query, getDocs, limit as firestoreLimit, orderBy } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    async function fetchData() {
      try {
        const bannersSnap = await getDocs(query(collection(firestore, "homepageBanners"), orderBy("displayOrder", "asc")));
        const fetchedBanners = bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-headline italic">Divine Shoe Store...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col">
      <AnnouncementTicker />
      <Navbar />
      
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        {banners.length > 0 ? (
          <Carousel className="w-full h-full" opts={{ loop: true }}>
            <CarouselContent className="h-full ml-0">
              {banners.map((banner, index) => (
                <CarouselItem key={banner.id} className="relative w-full h-full pl-0">
                  <Image 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    fill 
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center p-4">
                    <h1 className="font-headline text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg max-w-4xl">
                      {banner.title}
                    </h1>
                    <p className="text-lg md:text-xl mb-8 max-w-xl opacity-90 font-light">
                      {banner.description}
                    </p>
                    <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl hover:scale-105 transition-transform" asChild>
                      <Link href={banner.targetUrl || "/products"}>Explore Footwear</Link>
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {banners.length > 1 && (
              <>
                <CarouselPrevious className="left-4 bg-white/50 border-none hover:bg-white" />
                <CarouselNext className="right-4 bg-white/50 border-none hover:bg-white" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-12 text-center">
            <h1 className="font-headline text-5xl md:text-7xl font-bold mb-4">Divine Shoe Store</h1>
            <p className="text-muted-foreground max-w-md">Quality steps for a premium lifestyle. Manage your banners in the admin panel.</p>
          </div>
        )}
      </section>

      <section id="new-arrivals" className="container mx-auto px-4 py-20 scroll-mt-20">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-4xl font-headline font-bold mb-2">New Arrivals</h2>
          <div className="w-20 h-1 bg-primary rounded-full"></div>
          <p className="text-muted-foreground mt-4 italic">The latest steps in fashion</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {newArrivals.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {flashSaleProducts.length > 0 && (
        <section className="bg-primary/5 py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex flex-wrap items-center gap-6">
                <h2 className="text-4xl font-headline font-bold text-primary">Flash Sale</h2>
                <CountdownTimer targetDate={new Date(Date.now() + 86400000)} />
              </div>
              <Button variant="outline" className="self-start md:self-auto border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8" asChild>
                <Link href="/products?sale=true">View Sale Items</Link>
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

      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-4xl font-headline font-bold mb-2">The Shoe Collection</h2>
          <div className="w-20 h-1 bg-primary rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {allProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full px-12 h-14 text-lg border-primary text-primary hover:bg-primary hover:text-white transition-all"
            onClick={loadMoreProducts}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Discover More"}
          </Button>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}

function Footer() {
  const logoUrl = "https://scontent.fdac135-1.fna.fbcdn.net/v/t39.30808-6/628435890_122197311278360003_8388629514506424761_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeFHbPqMNMzeFabHnjPiUzvbas5aCNVn-kRqzloI1Wf6RHybfOk8Ngj71yZCJhpj75lVDwtqEovNxe0-O8o3FXav&_nc_ohc=u3Kitqoz264Q7kNvwGcn208&_nc_oc=AdrYML2ykAmp2oW7ealAClsd5IWtM7xA1YQy3ZjLWohDgf7J32UsUC3eFNA2cdSren_Y8T0nJ549vDNMLe-z84mL&_nc_zt=23&_nc_ht=scontent.fdac135-1.fna&_nc_gid=h1A5DOxHEA-tYX-YWh7LYQ&_nc_ss=7a3a8&oh=00_Afx1sjSxJn-9eMnWYoDYNIClTECgnuXBK_vHm0Jol6U2eQ&oe=69D1868C";

  return (
    <footer className="bg-white py-20 mt-20 border-t">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border shadow-sm">
              <Image src={logoUrl} alt="Divine.Co Logo" fill className="object-cover" />
            </div>
            <h3 className="font-headline text-3xl font-bold text-primary">Divine.Co</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Premium Shoe Store for the discerning modern lifestyle. We provide comfort and elegance in every step.
          </p>
          <div className="flex gap-4 mt-6">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
              <span className="sr-only">Facebook</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" /></svg>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-primary transition-colors">All Shoes</Link></li>
            <li><Link href="/#new-arrivals" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            <li><Link href="/control-panel" className="hover:text-primary transition-colors">Admin Portal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Support</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Join Us</h4>
          <p className="text-sm text-muted-foreground mb-4">Get the latest footwear trends and exclusive offers.</p>
          <div className="flex flex-col gap-2">
            <input type="email" placeholder="Your email address" className="bg-muted/50 border rounded-md px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all" />
            <Button className="w-full">Subscribe</Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-20 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground uppercase tracking-widest">
        <span>© 2024 Divine.Co Shoe Store. All rights reserved.</span>
        <div className="flex gap-6">
          <span>Secure Payments</span>
          <span>Fast Shipping</span>
          <span>Quality Footwear</span>
        </div>
      </div>
    </footer>
  );
}
