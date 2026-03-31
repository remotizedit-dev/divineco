"use client";

import { useState, useEffect } from "react";
import { getProducts, getCategories } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, Edit, Trash, Copy, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp, doc, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface VariantInput {
  color: string;
  size: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [variants, setVariants] = useState<VariantInput[]>([
    { color: "", size: "", stock: 0 }
  ]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProducts(prev => 
      prev.length === products.length ? [] : products.map(p => p.id)
    );
  };

  const addVariantRow = () => {
    setVariants([...variants, { color: "", size: "", stock: 0 }]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantInput, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addImageUrlRow = () => setImageUrls([...imageUrls, ""]);
  
  const removeImageUrlRow = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const basePrice = Number(formData.get("price"));
    const categoryId = formData.get("categoryId") as string;

    const totalStock = variants.reduce((sum, v) => sum + Number(v.stock), 0);
    
    // Filter and sanitize image URLs
    const finalImages = imageUrls.filter(url => url.trim() !== "");
    const defaultPlaceholder = `https://picsum.photos/seed/${Math.random()}/600/600`;
    const thumbnailUrl = finalImages[0] || defaultPlaceholder;
    const images = finalImages.length > 0 ? finalImages : [defaultPlaceholder];

    const productData = {
      name,
      slug,
      description,
      basePrice,
      categoryId,
      thumbnailUrl,
      imageUrls: images,
      isActive: true,
      tags: ["New Arrival"],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      stock: totalStock,
    };

    try {
      const productRef = await addDoc(collection(firestore, "products"), productData);
      const variantsCol = collection(firestore, "products", productRef.id, "productVariants");
      
      for (const variant of variants) {
        if (variant.size || variant.color) {
          await addDoc(variantsCol, {
            productId: productRef.id,
            color: variant.color || "Default",
            size: variant.size || "One Size",
            sku: `${slug}-${(variant.color || "DEF").substring(0, 3)}-${variant.size || "OS"}`.toUpperCase(),
            stockQuantity: Number(variant.stock),
            variantSpecificImageUrls: [thumbnailUrl],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      toast({
        title: "Product added",
        description: `${name} has been created successfully.`,
      });
      
      setIsAddDialogOpen(false);
      setVariants([{ color: "", size: "", stock: 0 }]);
      setImageUrls([""]);
      refreshData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">Manage your boutique inventory and variants.</p>
        </div>
        <div className="flex gap-3">
          {selectedProducts.length > 0 && (
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
              Bulk Actions ({selectedProducts.length})
            </Button>
          )}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-8 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Silk Evening Gown" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" placeholder="silk-evening-gown" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe the product details..." required className="min-h-[100px]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price (Tk)</Label>
                    <Input id="price" name="price" type="number" placeholder="2500" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select name="categoryId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Product Images</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addImageUrlRow} className="gap-1">
                      <Plus className="w-3 h-3" /> Add URL
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <Input 
                            value={url} 
                            onChange={(e) => updateImageUrl(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
                          <ImageIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive shrink-0"
                          onClick={() => removeImageUrlRow(index)}
                          disabled={imageUrls.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">The first image will be used as the product thumbnail.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Product Variants</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addVariantRow} className="gap-1">
                      <Plus className="w-3 h-3" /> Add Variant
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {variants.map((v, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-end bg-muted/30 p-4 rounded-lg border">
                        <div className="col-span-4 space-y-1.5">
                          <Label className="text-xs">Color</Label>
                          <Input 
                            value={v.color} 
                            onChange={(e) => updateVariant(index, "color", e.target.value)}
                            placeholder="Red"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="col-span-4 space-y-1.5">
                          <Label className="text-xs">Size</Label>
                          <Input 
                            value={v.size} 
                            onChange={(e) => updateVariant(index, "size", e.target.value)}
                            placeholder="M"
                            className="h-9 text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-3 space-y-1.5">
                          <Label className="text-xs">Stock</Label>
                          <Input 
                            type="number"
                            value={v.stock} 
                            onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="h-9 text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-1 pb-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-destructive"
                            onClick={() => removeVariantRow(index)}
                            disabled={variants.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Total stock will be calculated automatically based on variants.
                  </p>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border shadow-sm">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search by product name..." className="border-none shadow-none focus-visible:ring-0" />
      </div>

      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => toggleSelect(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                      <img src={product.thumbnailUrl || 'https://placehold.co/100x100'} alt={product.name} className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Slug: {product.slug || 'N/A'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Tk {product.basePrice}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={(product.stock || 0) > 10 ? "secondary" : "destructive"}>
                    {product.stock || 0} in stock
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={product.isFlashSale ? "default" : "outline"}>
                    {product.isFlashSale ? "Flash Sale" : "Regular"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive"><Trash className="w-4 h-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions for {selectedProducts.length} Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Apply Discount (%)</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Enter percentage..." />
                <Button>Apply</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBulkDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}