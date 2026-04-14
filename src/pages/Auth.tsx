import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Welcome back!",
        description: "Signing you into Career Compass AI...",
      });
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left Panel: Marketing/Identity */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/20" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </div>
          <span className="font-bold text-2xl text-white tracking-tight">
            Career Compass <span className="text-accent underline decoration-accent/30 underline-offset-4">AI</span>
          </span>
        </motion.div>

        <div className="relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.1]"
          >
            Unlock your <br />
            <span className="text-accent">Career Potential</span> <br />
            with AI.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/70 max-w-md font-medium"
          >
            Join thousands of professionals using Career Compass AI to optimize their resumes and land their dream jobs at top-tier companies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mt-8"
          >
            {[
              { icon: Briefcase, text: "Smart Matching" },
              { icon: CheckCircle2, text: "ATS Optimized" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-white/80 bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur-sm">
                <feature.icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 text-white/40 text-sm"
        >
          &copy; 2026 Career Compass AI. Empowering job seekers everywhere.
        </motion.p>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted border border-border p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Log In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-border shadow-2xl bg-card">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your dashboard
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-xs text-accent hover:underline">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full gradient-accent text-accent-foreground font-semibold h-11" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Log In"}
                      {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground px-8">
                      By clicking log in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-border shadow-2xl bg-card">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                  <CardDescription>
                    Start your journey to a better career today
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your full name"
                          className="pl-10"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full gradient-accent text-accent-foreground font-semibold h-11" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Account"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground px-8">
                      Already have an account? Log in above.
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
