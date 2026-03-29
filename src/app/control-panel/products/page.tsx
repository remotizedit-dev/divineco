
"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Edit, Trash, Copy } from "lucide-react";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

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
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
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
                      <img src={product.images?.[0] || 'https://placehold.co/100x100'} alt={product.name} className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Tk {product.price}</span>
                    {product.discountedPrice && (
                      <span className="text-xs line-through text-muted-foreground">Tk {product.discountedPrice}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.stock > 10 ? "secondary" : "destructive"}>
                    {product.stock} in stock
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
