
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
import { Plus, Search, MoreHorizontal, Edit, Trash, Copy, Loader2 } from "lucide-react";
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
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    const colorsInput = formData.get("colors") as string;
    const sizesInput = formData.get("sizes") as string;
    const stockQuantity = Number(formData.get("stock") || 0);

    const colors = colorsInput ? colorsInput.split(",").map(c => c.trim()).filter(Boolean) : [];
    const sizes = sizesInput ? sizesInput.split(",").map(s => s.trim()).filter(Boolean) : [];

    const productData = {
      name,
      slug,
      description,
      basePrice,
      categoryId,
      thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/600/600`,
      imageUrls: [`https://picsum.photos/seed/${Math.random()}/600/600`],
      isActive: true,
      tags: ["New Arrival"],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      stock: stockQuantity, // Add a top-level stock for easy viewing
    };

    try {
      // Create the product document first
      const productRef = await addDoc(collection(firestore, "products"), productData);
      
      // If variants are provided, create them in the subcollection
      if (colors.length > 0 || sizes.length > 0) {
        const variantsCol = collection(firestore, "products", productRef.id, "productVariants");
        
        // Simple strategy: Create a variant for each color/size combination if both exist, 
        // or just for colors/sizes if only one exists.
        const colorList = colors.length > 0 ? colors : ["Default"];
        const sizeList = sizes.length > 0 ? sizes : ["One Size"];

        for (const color of colorList) {
          for (const size of sizeList) {
            await addDoc(variantsCol, {
              productId: productRef.id,
              color,
              size,
              sku: `${slug}-${color.substring(0, 3)}-${size}`.toUpperCase(),
              stockQuantity: Math.floor(stockQuantity / (colorList.length * sizeList.length)),
              variantSpecificImageUrls: [productData.thumbnailUrl],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      toast({
        title: "Product added",
        description: `${name} and its variants have been created.`,
      });
      
      setIsAddDialogOpen(false);
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4 py-4">
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
                  <Textarea id="description" name="description" placeholder="Describe the product details..." required />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="colors">Colors (Comma separated)</Label>
                    <Input id="colors" name="colors" placeholder="Red, Blue, Green" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sizes">Sizes (Comma separated)</Label>
                    <Input id="sizes" name="sizes" placeholder="S, M, L, XL" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Total Initial Stock</Label>
                  <Input id="stock" name="stock" type="number" placeholder="100" />
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

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search by product name or SKU..." className="border-none shadow-none focus-visible:ring-0" />
      </div>

      <div className="bg-background rounded-lg border overflow-hidden">
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
                    {product.discountedPrice && (
                      <span className="text-xs line-through text-muted-foreground">Tk {product.discountedPrice}</span>
                    )}
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
                      <DropdownMenuItem className="gap-2"><Copy className="w-4 h-4" /> Duplicate</DropdownMenuItem>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Flash Sale Timer (Hours)</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Hours to run..." />
                <Button variant="secondary">Start Flash Sale</Button>
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
