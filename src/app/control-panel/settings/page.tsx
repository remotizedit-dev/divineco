
"use client";

import { useState, useEffect } from "react";
import { getProducts, getCategories } from "@/lib/api";
import { useFirestore } from "@/firebase";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, Percent, Clock, PackageCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Selection state
  const [selectionType, setSelectionType] = useState<"all" | "category" | "new_arrival" | "manual">("manual");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Discount state
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prods);
        setCategories(cats);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApplyDiscount = async () => {
    if (!firestore || !discountValue || !expiryDate) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill in all discount details and expiry date." });
      return;
    }

    setIsSubmitting(true);
    const batch = writeBatch(firestore);
    let targetProducts: any[] = [];

    if (selectionType === "all") {
      targetProducts = products;
    } else if (selectionType === "category") {
      targetProducts = products.filter(p => p.categoryId === selectedCategoryId);
    } else if (selectionType === "new_arrival") {
      targetProducts = products.filter(p => p.tags?.includes("New Arrival"));
    } else {
      targetProducts = products.filter(p => selectedProductIds.includes(p.id));
    }

    if (targetProducts.length === 0) {
      toast({ variant: "destructive", title: "No Products Selected", description: "Your current selection criteria matched 0 products." });
      setIsSubmitting(false);
      return;
    }

    targetProducts.forEach(product => {
      const originalPrice = product.compareAtPrice || product.salesPrice;
      let newPrice = product.salesPrice;
      const value = parseFloat(discountValue);

      if (discountType === "percentage") {
        newPrice = Math.round(originalPrice * (1 - value / 100));
      } else {
        newPrice = Math.round(originalPrice - value);
      }

      const productRef = doc(firestore, "products", product.id);
      batch.update(productRef, {
        isFlashSale: true,
        compareAtPrice: originalPrice,
        salesPrice: newPrice,
        flashSaleEndTime: new Date(expiryDate).toISOString(),
        updatedAt: serverTimestamp()
      });
    });

    try {
      await batch.commit();
      toast({ title: "Discounts Applied", description: `Successfully updated ${targetProducts.length} products.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not apply batch updates." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Store Settings</h2>
        <p className="text-muted-foreground">Manage bulk discounts and promotional timers across your inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-primary" /> Selection Criteria
              </CardTitle>
              <CardDescription>Choose which products will receive the discount.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>How do you want to select products?</Label>
                <Select value={selectionType} onValueChange={(val: any) => setSelectionType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Select Manually</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                    <SelectItem value="new_arrival">All New Arrivals</SelectItem>
                    <SelectItem value="all">Entire Store (All Products)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectionType === "category" && (
                <div className="space-y-4">
                  <Label>Select Category</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectionType === "manual" && (
                <div className="space-y-4">
                  <Label>Select Individual Products ({selectedProductIds.length} selected)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-md">
                    {products.map(p => (
                      <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`p-${p.id}`}
                          checked={selectedProductIds.includes(p.id)}
                          onCheckedChange={(checked) => {
                            setSelectedProductIds(prev => 
                              checked ? [...prev, p.id] : prev.filter(id => id !== p.id)
                            );
                          }}
                        />
                        <Label htmlFor={`p-${p.id}`} className="text-xs truncate cursor-pointer">{p.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" /> Discount Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={discountType} onValueChange={(val: any) => setDiscountType(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (Tk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 500"} 
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                    />
                    <div className="absolute right-3 top-2.5">
                      {discountType === "percentage" ? <Percent className="w-4 h-4 text-muted-foreground" /> : <span className="text-xs font-bold text-muted-foreground">TK</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Flash Sale End Time
                </Label>
                <Input 
                  type="datetime-local" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary bg-primary/5 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Apply Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p className="flex justify-between"><span>Selected items:</span> <span className="font-bold">
                  {selectionType === 'all' ? products.length : 
                   selectionType === 'category' ? products.filter(p => p.categoryId === selectedCategoryId).length :
                   selectionType === 'new_arrival' ? products.filter(p => p.tags?.includes('New Arrival')).length :
                   selectedProductIds.length}
                </span></p>
                <p className="flex justify-between"><span>Discount:</span> <span className="font-bold">{discountValue || '0'}{discountType === 'percentage' ? '%' : ' TK'}</span></p>
              </div>
              <Button 
                className="w-full h-14 text-lg gap-2" 
                onClick={handleApplyDiscount}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply Discounts Now"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground italic">
                This will update the sales price and set the flash sale timer for all selected products.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
