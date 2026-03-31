
"use client";

import { useState, useEffect } from "react";
import { getCoupons } from "@/lib/api";
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Ticket, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    refreshCoupons();
  }, [firestore]);

  const refreshCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCoupon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;

    const formData = new FormData(e.currentTarget);
    const couponData = {
      code: (formData.get("code") as string).toUpperCase(),
      type: formData.get("type") as string,
      value: Number(formData.get("value")),
      maxUses: Number(formData.get("maxUses")) || null,
      isActive: true,
      updatedAt: serverTimestamp(),
    };

    if (editingCoupon) {
      updateDocumentNonBlocking(doc(firestore, "coupons", editingCoupon.id), couponData);
      toast({ title: "Coupon Updated" });
    } else {
      addDocumentNonBlocking(collection(firestore, "coupons"), {
        ...couponData,
        usesCount: 0,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Coupon Created" });
    }

    setIsDialogOpen(false);
    setEditingCoupon(null);
    setTimeout(refreshCoupons, 1000);
  };

  const handleDeleteCoupon = (id: string) => {
    if (!firestore || !confirm("Delete this coupon?")) return;
    deleteDocumentNonBlocking(doc(firestore, "coupons", id));
    toast({ title: "Coupon Removed" });
    setTimeout(refreshCoupons, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coupons</h2>
          <p className="text-sm text-muted-foreground">Manage discounts and promotional codes.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingCoupon(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "New Coupon Code"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCoupon} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input id="code" name="code" defaultValue={editingCoupon?.code} placeholder="e.g. SAVE20" required className="uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select name="type" defaultValue={editingCoupon?.type || "fixed"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount (Tk)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" name="value" type="number" defaultValue={editingCoupon?.value} placeholder="50 or 20" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Maximum Uses</Label>
                <Input id="maxUses" name="maxUses" type="number" defaultValue={editingCoupon?.maxUses} placeholder="e.g. 100 (Leave empty for unlimited)" />
              </div>
              <DialogFooter>
                <Button type="submit">Save Coupon</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-bold">{coupon.code}</TableCell>
                  <TableCell className="capitalize">{coupon.type}</TableCell>
                  <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `Tk ${coupon.value}`}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">{coupon.usesCount} / {coupon.maxUses || "∞"}</span>
                      {coupon.maxUses && (
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(100, (coupon.usesCount / coupon.maxUses) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "secondary" : "outline"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingCoupon(coupon); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCoupon(coupon.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                    No coupons created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
