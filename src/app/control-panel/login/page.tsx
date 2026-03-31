"use client";

import { useState } from "react";
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // Ensure admin role exists upon login
        setDocumentNonBlocking(
          doc(db, "roles_admin", user.uid),
          {
            email: user.email,
            lastLogin: serverTimestamp(),
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
        
        // Seed the admin role for the user
        setDocumentNonBlocking(
          doc(db, "roles_admin", user.uid),
          {
            email: user.email,
            assignedAt: serverTimestamp(),
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
      <Card className="w-full max-w-md shadow-lg border-none">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">Divine.Co Admin</CardTitle>
            <CardDescription>Manage your premium boutique experience</CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="admin@divine.co" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full h-11" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="new-admin@divine.co" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full h-11 gap-2" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                    <><UserPlus className="w-4 h-4" /> Create Admin Account</>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  By signing up, you will create a new administrator profile with full access.
                </p>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}