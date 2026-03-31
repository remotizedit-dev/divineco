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
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2, Trash2, Image as ImageIcon, Filter } from "lucide-react";
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
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleSelect = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProducts(prev => 
      prev.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id)
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

  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("catName") as string;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const description = formData.get("catDesc") as string;

    const categoryData = { 
      name, 
      slug, 
      description, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp() 
    };

    addDocumentNonBlocking(collection(firestore, "categories"), categoryData);
    
    toast({ title: "Category Submitted", description: "Your category is being created." });
    setIsAddCategoryOpen(false);
    // Optimistic refresh
    setTimeout(refreshData, 1000);
  };

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const basePrice = Number(formData.get("price"));
    const categoryId = formData.get("categoryId") as string;

    const totalStock = variants.reduce((sum, v) => sum + Number(v.stock), 0);
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

    addDocumentNonBlocking(collection(firestore, "products"), productData)
      ?.then((productRef) => {
        if (!productRef) return;
        const variantsCol = collection(firestore, "products", productRef.id, "productVariants");
        
        for (const variant of variants) {
          if (variant.size || variant.color) {
            addDocumentNonBlocking(variantsCol, {
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
      });

    toast({ title: "Product Submitted", description: "Saving product and its variants..." });
    setIsAddDialogOpen(false);
    setVariants([{ color: "", size: "", stock: 0 }]);
    setImageUrls([""]);
    setTimeout(refreshData, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">Manage your boutique inventory and variants.</p>
        </div>
        <div className="flex gap-3">
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
                  <Textarea id="description" name="description" placeholder="Describe the product..." required className="min-h-[100px]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price (Tk)</Label>
                    <Input id="price" name="price" type="number" placeholder="2500" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="flex gap-2">
                      <Select name="categoryId" required>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
                          <form onSubmit={handleAddCategory} className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="catName">Category Name</Label>
                              <Input id="catName" name="catName" placeholder="e.g. Accessories" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="catDesc">Description</Label>
                              <Textarea id="catDesc" name="catDesc" placeholder="Brief description..." />
                            </div>
                            <DialogFooter>
                              <Button type="submit">Save Category</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
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
                          <Input value={url} onChange={(e) => updateImageUrl(index, e.target.value)} placeholder="https://..." />
                          <ImageIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeImageUrlRow(index)} disabled={imageUrls.length <= 1}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
                          <Input value={v.color} onChange={(e) => updateVariant(index, "color", e.target.value)} placeholder="Red" className="h-9 text-sm" />
                        </div>
                        <div className="col-span-4 space-y-1.5">
                          <Label className="text-xs">Size</Label>
                          <Input value={v.size} onChange={(e) => updateVariant(index, "size", e.target.value)} placeholder="M" className="h-9 text-sm" required />
                        </div>
                        <div className="col-span-3 space-y-1.5">
                          <Label className="text-xs">Stock</Label>
                          <Input type="number" value={v.stock} onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)} placeholder="0" className="h-9 text-sm" required />
                        </div>
                        <div className="col-span-1 pb-1">
                          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeVariantRow(index)} disabled={variants.length <= 1}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-4 bg-background p-4 rounded-lg border shadow-sm">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search by product name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0" 
          />
        </div>
        <div className="w-full md:w-[250px] flex items-center gap-2 bg-background p-4 rounded-lg border shadow-sm">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
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
                <TableCell><span className="font-bold text-sm">Tk {product.basePrice}</span></TableCell>
                <TableCell>
                  <Badge variant={(product.stock || 0) > 10 ? "secondary" : "destructive"}>
                    {product.stock || 0} in stock
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
}