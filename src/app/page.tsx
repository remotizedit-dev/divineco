'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/public/ProductCard";
import { useFirestore } from "@/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

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
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-4">
                    <h1 className="font-headline text-5xl md:text-8xl font-bold mb-6 drop-shadow-2xl max-w-4xl tracking-tight">
                      {banner.title}
                    </h1>
                    <p className="text-lg md:text-2xl mb-10 max-w-xl opacity-90 font-light italic">
                      {banner.description}
                    </p>
                    <Button size="lg" className="rounded-full px-12 h-16 text-xl shadow-2xl hover:scale-105 transition-transform" asChild>
                      <Link href={banner.targetUrl || "/products"}>Discover Collection</Link>
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {banners.length > 1 && (
              <>
                <CarouselPrevious className="left-4 bg-white/20 border-none hover:bg-white/40 text-white" />
                <CarouselNext className="right-4 bg-white/20 border-none hover:bg-white/40 text-white" />
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

      <section id="new-arrivals" className="container mx-auto px-4 py-24 scroll-mt-20">
        <div className="flex flex-col items-center mb-16 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary px-4 py-1 text-[10px] uppercase tracking-widest font-bold">New Arrivals</Badge>
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">The Latest Steps</h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
          {newArrivals.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {flashSaleProducts.length > 0 && (
        <section className="bg-primary/[0.03] py-24 border-y border-primary/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Flash Sale</h2>
                  <p className="text-muted-foreground italic text-sm">Limited time premium offers</p>
                </div>
                <CountdownTimer 
                  targetDate={new Date(Date.now() + 86400000)} 
                  className="h-14 text-2xl px-6 rounded-2xl shadow-lg shadow-primary/10 border-primary/20"
                />
              </div>
              <Button variant="outline" className="self-start md:self-auto border-primary text-primary hover:bg-primary hover:text-white rounded-full px-10 h-12" asChild>
                <Link href="/products?sale=true">View All Offers</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {flashSaleProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-24">
        <div className="flex flex-col items-center mb-16 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary px-4 py-1 text-[10px] uppercase tracking-widest font-bold">Collections</Badge>
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">The Complete Gallery</h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
          {allProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full px-16 h-16 text-xl border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/5"
            onClick={loadMoreProducts}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : "Load More Experience"}
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
    <footer className="bg-white py-24 mt-20 border-t">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10 shadow-md">
              <Image src={logoUrl} alt="Divine.Co Logo" fill className="object-cover" />
            </div>
            <h3 className="font-headline text-3xl font-bold text-primary">Divine.Co</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-8">
            Premium Shoe Store for the discerning modern lifestyle. We provide comfort and elegance in every step you take.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <Instagram className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-foreground">Navigation</h4>
          <ul className="space-y-4 text-sm text-muted-foreground font-medium">
            <li><Link href="/products" className="hover:text-primary transition-colors">Complete Collection</Link></li>
            <li><Link href="/#new-arrivals" className="hover:text-primary transition-colors">Latest Releases</Link></li>
            <li><Link href="/checkout" className="hover:text-primary transition-colors">Your Shopping Bag</Link></li>
            <li><Link href="/control-panel" className="hover:text-primary transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-foreground">Contact Us</h4>
          <ul className="space-y-4 text-sm text-muted-foreground font-medium">
            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +880 1XXX-XXXXXX</li>
            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> support@divine.co</li>
            <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-primary mt-0.5" /> Dhaka, Bangladesh</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-foreground">Stay Informed</h4>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Subscribe to receive updates on new drops and exclusive flash sale access.</p>
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="Your professional email" 
              className="bg-muted/30 border-none rounded-xl px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner" 
            />
            <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">Join the Inner Circle</Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-24 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
        <span>© 2024 Divine.Co Premium Shoe Store</span>
        <div className="flex flex-wrap justify-center gap-8">
          <span>Trusted Quality</span>
          <span>Fast Distribution</span>
          <span>Secure Transactions</span>
        </div>
      </div>
    </footer>
  );
}
