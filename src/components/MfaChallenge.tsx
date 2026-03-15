import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MfaChallengeProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MfaChallenge({ onSuccess, onCancel }: MfaChallengeProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({ title: "Enter a 6-digit code", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find((f) => f.status === "verified");

      if (!totpFactor) {
        toast({ title: "No 2FA factor found", variant: "destructive" });
        return;
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) throw verifyError;

      onSuccess();
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Shield className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
          <p className="text-xs text-muted-foreground">Enter the code from your authenticator app</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Verification Code
        </Label>
        <Input
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          className="text-center text-lg tracking-[0.5em] font-mono h-12 rounded-xl border-border/60 bg-card focus:border-primary/40 focus:shadow-search transition-all"
          autoFocus
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 h-11 rounded-xl">
          Back
        </Button>
        <Button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="flex-1 h-11 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl group"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              Verify <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
