
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const logoUrl = "https://scontent.fdac135-1.fna.fbcdn.net/v/t39.30808-6/628435890_122197311278360003_8388629514506424761_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeFHbPqMNMzeFabHnjPiUzvbas5aCNVn-kRqzloI1Wf6RHybfOk8Ngj71yZCJhpj75lVDwtqEovNxe0-O8o3FXav&_nc_ohc=u3Kitqoz264Q7kNvwGcn208&_nc_oc=AdrYML2ykAmp2oW7ealAClsd5IWtM7xA1YQy3ZjLWohDgf7J32UsUC3eFNA2cdSren_Y8T0nJ549vDNMLe-z84mL&_nc_zt=23&_nc_ht=scontent.fdac135-1.fna&_nc_gid=h1A5DOxHEA-tYX-YWh7LYQ&_nc_ss=7a3a8&oh=00_Afx1sjSxJn-9eMnWYoDYNIClTECgnuXBK_vHm0Jol6U2eQ&oe=69D1868C";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setDocumentNonBlocking(
          doc(db, "roles_admin", user.uid),
          {
            email: user.email,
            lastLogin: serverTimestamp(),
            role: "admin"
          },
          { merge: true }
        );
        router.push("/control-panel");
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
        });
      });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setDocumentNonBlocking(
          doc(db, "roles_admin", user.uid),
          {
            email: user.email,
            assignedAt: serverTimestamp(),
            role: "admin"
          },
          { merge: true }
        );

        toast({
          title: "Account Created",
          description: "Welcome! You have been registered as an administrator.",
        });
        router.push("/control-panel");
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message || "Could not create account.",
        });
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg border-none overflow-hidden">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="space-y-1 text-center bg-white border-b">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-muted shadow-lg mx-auto mb-4">
              <Image src={logoUrl} alt="Divine Logo" fill className="object-cover" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold text-primary">Divine Shoe Store</CardTitle>
            <CardDescription>Administrative Dashboard</CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="admin@divine.co" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full h-11" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Access Dashboard"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="new-admin@divine.co" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full h-11 gap-2" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                    <><UserPlus className="w-4 h-4" /> Register Admin</>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                  Secure access for authorized staff only.
                </p>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
