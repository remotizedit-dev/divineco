
"use client";

import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Phone, MapPin, Package, Clock, MoreHorizontal, Eye, CheckCircle2, XCircle, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    refreshOrders();
  }, []);

  const refreshOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast({ title: "Order Updated", description: `Status changed to ${newStatus}` });
      refreshOrders();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return <Badge variant="secondary">Pending</Badge>;
      case "Accepted": return <Badge className="bg-blue-500 hover:bg-blue-600">Accepted</Badge>;
      case "Delivered": return <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>;
      case "Cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <p className="text-sm text-muted-foreground">Track and manage customer orders and fulfillment.</p>
        </div>
        <Button variant="outline" onClick={refreshOrders}>Refresh</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-bold text-primary">{order.orderNumber || `#${order.id.substring(0, 8)}`}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {order.createdAt ? format(order.createdAt.seconds * 1000, "MMM dd, yyyy HH:mm") : "Recently"}
                  </TableCell>
                  <TableCell className="font-bold">Tk {order.total}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDetails(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Accepted")} className="gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" /> Accept Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Delivered")} className="gap-2">
                            <Truck className="w-4 h-4 text-green-500" /> Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Cancelled")} className="gap-2 text-destructive">
                            <XCircle className="w-4 h-4" /> Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                    No orders placed yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details {selectedOrder?.orderNumber || `#${selectedOrder?.id?.substring(0, 8)}`}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Customer Information</h4>
                  <div className="text-sm space-y-2">
                    <p className="font-bold text-lg">{selectedOrder.customerName}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-primary" /> {selectedOrder.customerPhone}</p>
                    <p className="flex items-start gap-2"><MapPin className="w-3 h-3 mt-1 text-primary" /> {selectedOrder.customerAddress}</p>
                    <p className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold mt-2">{selectedOrder.deliveryRegion}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Fulfillment Status</h4>
                  <div className="space-y-4">
                    <Select 
                      defaultValue={selectedOrder.status} 
                      onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Accepted">Accepted (Shipment Prepared)</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="p-3 bg-muted/50 rounded-lg text-[10px] space-y-2 font-medium uppercase tracking-wider">
                      <p className="flex items-center gap-2 text-muted-foreground"><Clock className="w-3 h-3" /> Placed: {selectedOrder.createdAt ? format(selectedOrder.createdAt.seconds * 1000, "PPpp") : "Recently"}</p>
                      <p className="flex items-center gap-2 text-muted-foreground"><Package className="w-3 h-3" /> Method: {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Order Items</h4>
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="h-10 text-xs">Product</TableHead>
                        <TableHead className="h-10 text-xs">Variant</TableHead>
                        <TableHead className="h-10 text-xs text-center">Qty</TableHead>
                        <TableHead className="h-10 text-xs text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 relative rounded-md overflow-hidden bg-muted border flex-shrink-0 shadow-sm">
                                <Image 
                                  src={item.image || 'https://placehold.co/100x120?text=No+Image'} 
                                  alt={item.name} 
                                  fill 
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-bold text-sm leading-tight">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs text-muted-foreground italic">
                            {item.variant ? `${item.variant.color} / ${item.variant.size}` : "One Size"}
                          </TableCell>
                          <TableCell className="py-3 text-sm text-center font-medium">{item.quantity}</TableCell>
                          <TableCell className="py-3 text-sm text-right font-bold">Tk {item.price * item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 pt-6 border-t">
                <div className="flex justify-between w-64 text-sm text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-bold text-foreground">Tk {selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between w-64 text-sm text-muted-foreground">
                  <span>Shipping:</span>
                  <span className="font-bold text-foreground">Tk {selectedOrder.shippingCost}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between w-64 text-sm font-bold text-green-600 bg-green-50 p-2 rounded">
                    <span>Discount:</span>
                    <span>-Tk {selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 text-2xl font-bold pt-4 border-t border-muted-foreground/10">
                  <span className="text-primary">Total:</span>
                  <span className="text-primary">Tk {selectedOrder.total}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
