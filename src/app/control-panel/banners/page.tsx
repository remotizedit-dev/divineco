"use client";

import { useState, useEffect } from "react";
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, getDocs, orderBy, doc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, ImageIcon, MoveUp, MoveDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    refreshBanners();
  }, [firestore]);

  const refreshBanners = async () => {
    if (!firestore) return;
    setIsLoading(true);
    try {
      const q = query(collection(firestore, "homepageBanners"), orderBy("displayOrder", "asc"));
      const snap = await getDocs(q);
      setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBanner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;

    const formData = new FormData(e.currentTarget);
    const bannerData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      targetUrl: formData.get("targetUrl") as string,
      displayOrder: editingBanner ? editingBanner.displayOrder : banners.length,
      isActive: true,
      updatedAt: serverTimestamp(),
    };

    if (editingBanner) {
      updateDocumentNonBlocking(doc(firestore, "homepageBanners", editingBanner.id), bannerData);
      toast({ title: "Banner Updated", description: "Homepage banner changes are being applied." });
    } else {
      addDocumentNonBlocking(collection(firestore, "homepageBanners"), {
        ...bannerData,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Banner Created", description: "New banner added to homepage rotation." });
    }

    setIsDialogOpen(false);
    setEditingBanner(null);
    setTimeout(refreshBanners, 1000);
  };

  const handleDeleteBanner = (id: string) => {
    if (!firestore || !confirm("Delete this banner?")) return;
    deleteDocumentNonBlocking(doc(firestore, "homepageBanners", id));
    toast({ title: "Banner Removed" });
    setTimeout(refreshBanners, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Homepage Banners</h2>
          <p className="text-sm text-muted-foreground">Manage the premium hero sliders on your storefront.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingBanner(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBanner ? "Edit Banner" : "New Hero Banner"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveBanner} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Headline</Label>
                <Input id="title" name="title" defaultValue={editingBanner?.title} placeholder="e.g. Summer Radiance Collection" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Sub-headline</Label>
                <Textarea id="description" name="description" defaultValue={editingBanner?.description} placeholder="Short engaging description..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <div className="flex gap-2">
                  <Input id="imageUrl" name="imageUrl" defaultValue={editingBanner?.imageUrl} placeholder="https://..." required />
                  <div className="w-10 h-10 rounded border flex items-center justify-center bg-muted shrink-0 overflow-hidden">
                    {editingBanner?.imageUrl ? <img src={editingBanner.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetUrl">Click Target URL</Label>
                <Input id="targetUrl" name="targetUrl" defaultValue={editingBanner?.targetUrl} placeholder="/products" />
              </div>
              <DialogFooter>
                <Button type="submit">Save Banner</Button>
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
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, idx) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      {idx + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32 h-16 rounded overflow-hidden border bg-muted">
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-sm">{banner.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{banner.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingBanner(banner); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBanner(banner.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                    No hero banners configured. Your homepage will use default placeholders.
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
