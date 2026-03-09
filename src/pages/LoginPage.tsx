import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Target, Sparkles, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      toast({ title: "Login failed", description: result.error, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome back!" });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — immersive brand experience */}
      <div className="hidden w-[55%] gradient-hero lg:flex lg:flex-col lg:justify-between relative overflow-hidden p-10">
        {/* Abstract background elements */}
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(258 50% 58%), transparent 65%)" }} />
        <div className="absolute bottom-[-10%] left-[-8%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(230 72% 52%), transparent 65%)" }} />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(162 55% 38%), transparent 70%)" }} />

        <Link to="/" className="relative flex items-center gap-2.5 z-10">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold text-primary-foreground/90 tracking-tight">EduGrant AI</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="font-display text-4xl font-extrabold text-primary-foreground leading-[1.12] tracking-tight">
              Your Scholarship<br />Strategy Starts<br /><span className="text-gradient">Right Here.</span>
            </h2>
            <p className="mt-5 text-primary-foreground/45 text-base leading-relaxed max-w-md">
              AI-powered matching with approval prediction, funding gap analysis, and smart application prioritization.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="mt-10">
            <div className="rounded-2xl border border-primary-foreground/8 bg-primary-foreground/[0.04] backdrop-blur-md p-5 max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <Target className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">Top Match Found</p>
                  <p className="text-[11px] text-primary-foreground/35">National Merit Scholarship</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-primary-foreground/35">Match Score</span>
                  <span className="text-sm font-bold text-primary-foreground">94%</span>
                </div>
                <div className="h-1.5 rounded-full bg-primary-foreground/8 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} transition={{ duration: 1.2, delay: 0.6 }} className="h-full rounded-full gradient-primary" />
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="text-[10px] font-medium bg-success/15 text-success px-2 py-0.5 rounded-full">🔥 High Approval</span>
                  <span className="text-[10px] font-medium bg-primary/15 text-primary px-2 py-0.5 rounded-full">💰 ₹50,000</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="relative z-10 flex items-center gap-8">
          {[
            { icon: Shield, label: "40+ Scholarships" },
            { icon: Sparkles, label: "AI-Matched" },
            { icon: TrendingUp, label: "Approval Prediction" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-primary-foreground/30">
              <t.icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{t.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-[45%]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="w-full max-w-sm">
          <Link to="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">EduGrant AI</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-extrabold text-foreground tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to your scholarship dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-11 h-11 rounded-xl border-border/60 bg-card focus:border-primary/40 focus:shadow-search transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
            <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" className="pl-11 pr-11 h-11 rounded-xl border-border/60 bg-card focus:border-primary/40 focus:shadow-search transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl text-sm group">
              {loading ? "Signing in..." : <>Sign In <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">Create one free</Link>
            </p>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground/40">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-[11px]">Your data is encrypted and secure</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
