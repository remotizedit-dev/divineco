
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getDashboardStats } from "@/lib/api";
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertCircle } from "lucide-react";

const mockSalesData = [
  { day: 'Mon', sales: 4000 },
  { day: 'Tue', sales: 3000 },
  { day: 'Wed', sales: 5000 },
  { day: 'Thu', sales: 2780 },
  { day: 'Fri', sales: 6890 },
  { day: 'Sat', sales: 8390 },
  { day: 'Sun', sales: 4490 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const statCards = [
    { title: "Total Sales", value: `Tk ${stats?.totalSales || 0}`, icon: DollarSign, color: "text-green-600" },
    { title: "Total Profit", value: `Tk ${stats?.totalProfit || 0}`, icon: TrendingUp, color: "text-blue-600" },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, color: "text-primary" },
    { title: "Stock Value", value: "Tk 45,000", icon: Package, color: "text-amber-600" },
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

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockSalesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                {mockSalesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      C
                    </div>
                    <div>
                      <p className="text-sm font-medium">Customer {i}</p>
                      <p className="text-xs text-muted-foreground">#ORD-100{i}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">Tk 2,500</p>
                    <p className="text-[10px] uppercase text-green-600 font-bold">Delivered</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                      <img src={`https://picsum.photos/seed/prod${i}/100/100`} alt="Product" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Lace Trim Dress</p>
                      <p className="text-xs text-red-600 font-medium">Only 2 left in stock</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-primary underline">Restock</button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
