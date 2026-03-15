import { useState } from "react";
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function TwoFactorSetup() {
  const { toast } = useToast();
  const [step, setStep] = useState<"idle" | "enrolling" | "verifying" | "enabled">("idle");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if MFA is already enrolled
  const checkStatus = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    if (data?.totp && data.totp.length > 0) {
      const verified = data.totp.find((f) => f.status === "verified");
      if (verified) {
        setIsEnabled(true);
        setFactorId(verified.id);
        setStep("enabled");
        return true;
      }
    }
    return false;
  };

  // Initialize on mount-like behavior
  useState(() => {
    checkStatus();
  });

  const startEnrollment = async () => {
    setLoading(true);
    try {
      // Unenroll any unverified factors first
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp) {
        for (const f of factors.totp) {
          if (f.status !== "verified") {
            await supabase.auth.mfa.unenroll({ factorId: f.id });
          }
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "EduGrant Authenticator",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("enrolling");
    } catch (err: any) {
      toast({ title: "Failed to start 2FA setup", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      toast({ title: "Enter a 6-digit code", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      setChallengeId(challenge.id);

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      setIsEnabled(true);
      setStep("enabled");
      toast({ title: "2FA enabled successfully! 🎉", description: "Your account is now more secure." });
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      setIsEnabled(false);
      setStep("idle");
      setQrCode("");
      setSecret("");
      setFactorId("");
      setVerifyCode("");
      toast({ title: "2FA disabled", description: "Two-factor authentication has been removed." });
    } catch (err: any) {
      toast({ title: "Failed to disable 2FA", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mt-4 shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security using an authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "idle" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">2FA is not enabled</p>
                <p className="text-xs text-muted-foreground">Protect your account with a TOTP authenticator app</p>
              </div>
            </div>
            <Button onClick={startEnrollment} disabled={loading} className="gradient-primary text-primary-foreground font-semibold shadow-glow">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              Enable 2FA
            </Button>
          </div>
        )}

        {step === "enrolling" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">1. Scan this QR code with your authenticator app</p>
              <div className="flex justify-center rounded-xl border border-border/60 bg-card p-4">
                <img src={qrCode} alt="2FA QR Code" className="h-48 w-48" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Or enter this secret manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted/50 px-3 py-2 text-xs font-mono text-foreground break-all">
                  {secret}
                </code>
                <Button variant="outline" size="icon" onClick={copySecret} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">2. Enter the 6-digit code from your app</Label>
              <Input
                placeholder="000000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-[0.5em] font-mono h-12 rounded-xl"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("idle")} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={verifyAndEnable} disabled={loading || verifyCode.length !== 6} className="gradient-primary text-primary-foreground font-semibold shadow-glow">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify & Enable
              </Button>
            </div>
          </div>
        )}

        {step === "enabled" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
              <ShieldCheck className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-foreground">2FA is enabled</p>
                <p className="text-xs text-muted-foreground">Your account is protected with two-factor authentication</p>
              </div>
            </div>
            <Button variant="outline" onClick={disable2FA} disabled={loading} className="text-destructive hover:text-destructive">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldOff className="mr-2 h-4 w-4" />}
              Disable 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
