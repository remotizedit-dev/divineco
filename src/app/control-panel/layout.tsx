
"use client";

import { useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Loader2, Image as ImageIcon, Ticket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";

const navigation = [
  { name: 'Dashboard', href: '/control-panel', icon: LayoutDashboard },
  { name: 'Orders', href: '/control-panel/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/control-panel/products', icon: Package },
  { name: 'Home Banners', href: '/control-panel/banners', icon: ImageIcon },
  { name: 'Coupons', href: '/control-panel/coupons', icon: Ticket },
  { name: 'Bulk Discounts', href: '/control-panel/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const logoUrl = "https://scontent.fdac135-1.fna.fbcdn.net/v/t39.30808-6/628435890_122197311278360003_8388629514506424761_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeFHbPqMNMzeFabHnjPiUzvbas5aCNVn-kRqzloI1Wf6RHybfOk8Ngj71yZCJhpj75lVDwtqEovNxe0-O8o3FXav&_nc_ohc=u3Kitqoz264Q7kNvwGcn208&_nc_oc=AdrYML2ykAmp2oW7ealAClsd5IWtM7xA1YQy3ZjLWohDgf7J32UsUC3eFNA2cdSren_Y8T0nJ549vDNMLe-z84mL&_nc_zt=23&_nc_ht=scontent.fdac135-1.fna&_nc_gid=h1A5DOxHEA-tYX-YWh7LYQ&_nc_ss=7a3a8&oh=00_Afx1sjSxJn-9eMnWYoDYNIClTECgnuXBK_vHm0Jol6U2eQ&oe=69D1868C";

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
        <SidebarHeader className="h-24 flex items-center px-6 border-b gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border shrink-0">
            <Image src={logoUrl} alt="Logo" fill className="object-cover" />
          </div>
          <Link href="/control-panel" className="font-headline text-lg font-bold text-primary truncate">
            Divine Shoe Store
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
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user.email}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Administrator</p>
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
