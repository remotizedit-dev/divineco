
'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { AnnouncementTicker } from "@/components/public/AnnouncementTicker";
import { getProducts, getCategoryBySlug } from "@/lib/api";
import { ProductCard } from "@/components/public/ProductCard";
import { Loader2 } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const cat = await getCategoryBySlug(slug as string);
        if (cat) {
          setCategory(cat);
          const prods = await getProducts({ categoryId: cat.id });
          setProducts(prods);
        }
      } catch (error) {
        console.error("Failed to load category data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

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

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Category not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementTicker />
      <Navbar />
      
      <section className="bg-muted/30 py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            No products found in this category.
          </div>
        )}
      </section>
    </div>
  );
}
