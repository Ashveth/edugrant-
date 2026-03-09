import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the hash fragment
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check hash for type=recovery (handles page reload)
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setSuccess(true);
    toast({ title: "Password updated successfully!" });
    setTimeout(() => navigate("/login", { replace: true }), 2500);
  };

  if (!isRecovery && !success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <GraduationCap className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Invalid or expired link</h1>
          <p className="text-sm text-muted-foreground mb-6">This password reset link is no longer valid. Please request a new one.</p>
          <Button asChild className="gradient-primary text-primary-foreground rounded-xl">
            <Link to="/forgot-password">Request New Link</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-center gap-2.5">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">EduGrant AI</span>
        </Link>

        {success ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h1 className="font-display text-2xl font-extrabold text-foreground mb-2">Password updated!</h1>
            <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-display text-2xl font-extrabold text-foreground tracking-tight">Set new password</h1>
              <p className="mt-2 text-sm text-muted-foreground">Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-11 rounded-xl border-border/60 bg-card focus:border-primary/40 focus:shadow-search transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirm Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="confirm"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 h-11 rounded-xl border-border/60 bg-card focus:border-primary/40 focus:shadow-search transition-all"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl text-sm">
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
