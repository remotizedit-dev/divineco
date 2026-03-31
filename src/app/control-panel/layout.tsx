
"use client";

import { useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Loader2, Image as ImageIcon, Ticket } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";

const navigation = [
  { name: 'Dashboard', href: '/control-panel', icon: LayoutDashboard },
  { name: 'Orders', href: '/control-panel/orders', icon: ShoppingCart },
  { name: 'Products', href: '/control-panel/products', icon: Package },
  { name: 'Home Banners', href: '/control-panel/banners', icon: ImageIcon },
  { name: 'Coupons', href: '/control-panel/coupons', icon: Ticket },
  { name: 'Settings', href: '/control-panel/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const isLoginPage = pathname === "/control-panel/login";

  useEffect(() => {
    if (!isUserLoading && !user && !isLoginPage) {
      router.push("/control-panel/login");
    }
  }, [user, isUserLoading, isLoginPage, router]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push("/control-panel/login");
    });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="h-20 flex items-center px-6 border-b">
          <Link href="/control-panel" className="font-headline text-xl font-bold text-primary truncate">
            Divine.Co Admin
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.href}
                  tooltip={item.name}
                >
                  <Link href={item.href}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto p-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                className="text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </Sidebar>
      <SidebarInset className="bg-muted/30">
        <header className="h-16 flex items-center justify-between px-8 bg-background border-b sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="font-semibold text-lg">
              {navigation.find(n => n.href === pathname)?.name || 'Control Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold uppercase">
              {user.email?.substring(0, 2) || "AD"}
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
