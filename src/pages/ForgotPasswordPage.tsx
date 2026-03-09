import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: "Check your inbox", description: "We sent a password reset link to your email." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="mb-10 flex items-center gap-2.5">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">EduGrant AI</span>
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-extrabold text-foreground tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sent
              ? "We've sent a reset link to your email. Check your inbox and spam folder."
              : "Enter the email you signed up with and we'll send a reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-11 h-11 rounded-xl border-border/60 bg-card focus:border-primary/40 focus:shadow-search transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl text-sm group">
              {loading ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send Reset Link</>}
            </Button>
          </form>
        ) : (
          <Button asChild variant="outline" className="w-full h-11 rounded-xl">
            <Link to="/login">Back to Login</Link>
          </Button>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
