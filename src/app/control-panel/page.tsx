"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getDashboardStats } from "@/lib/api";
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Sales", value: `Tk ${stats?.totalSales?.toLocaleString() || 0}`, icon: DollarSign, color: "text-green-600" },
    { title: "Stock Value", value: `Tk ${stats?.stockValue?.toLocaleString() || 0}`, icon: Package, color: "text-amber-600" },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, color: "text-primary" },
    { title: "Total Inventory", value: `${stats?.totalInventory || 0} Units`, icon: Package, color: "text-blue-600" },
    { title: "Cancelled", value: stats?.cancelledOrders || 0, icon: AlertCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {order.customerName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">{order.orderNumber || `#${order.id.substring(0, 6)}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">Tk {order.total}</p>
                    <p className={`text-[10px] uppercase font-bold ${
                      order.status === 'Cancelled' ? 'text-red-600' : 
                      order.status === 'Delivered' ? 'text-green-600' : 'text-amber-600'
                    }`}>{order.status}</p>
                  </div>
                </div>
              ))}
              {!stats?.recentOrders?.length && (
                <p className="text-center text-muted-foreground py-10 italic">No orders yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.lowStockItems?.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden relative">
                      <img src={product.thumbnailUrl} alt={product.name} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[150px]">{product.name}</p>
                      <p className="text-xs text-red-600 font-medium">Only {product.stock || 0} left in stock</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">Tk {product.salesPrice}</p>
                  </div>
                </div>
              ))}
              {!stats?.lowStockItems?.length && (
                <p className="text-center text-green-600 py-10 italic">All stock levels are healthy.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
