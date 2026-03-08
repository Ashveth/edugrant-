import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Loader2, CheckCircle2, AlertTriangle, XOctagon, Globe, Mail, CreditCard, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ScamResult {
  verdict: "verified" | "suspicious" | "potential_scam";
  confidence: number;
  redFlags: string[];
  greenFlags: string[];
  analysis: {
    websiteAuthenticity: string;
    applicationFees: string;
    emailCredibility: string;
    organizationVerified: boolean;
  };
  explanation: string;
  recommendation: string;
  error?: string;
}

export default function ScamDetectorPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamResult | null>(null);

  const handleCheck = async () => {
    if (!url.trim() && !details.trim()) {
      toast({ title: "Please enter a URL or scholarship details", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scam-detector`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ url: url.trim(), details: details.trim() }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Check failed");
      }

      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Check failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verdictConfig = {
    verified: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900", border: "border-emerald-200 dark:border-emerald-800", label: "✅ Verified", badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
    suspicious: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900", border: "border-amber-200 dark:border-amber-800", label: "⚠️ Suspicious", badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
    potential_scam: { icon: XOctagon, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900", border: "border-red-200 dark:border-red-800", label: "🚨 Potential Scam", badgeClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  };

  const analysisIcons = {
    websiteAuthenticity: { icon: Globe, label: "Website" },
    applicationFees: { icon: CreditCard, label: "Fees" },
    emailCredibility: { icon: Mail, label: "Email" },
    organizationVerified: { icon: Building, label: "Organization" },
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" /> AI Scam Detector
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a scholarship URL or details to check if it's legitimate or a potential scam.
        </p>
      </div>

      {/* Input */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Scholarship URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://scholarship-website.com/apply"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Additional Details (optional)</label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Paste the scholarship description, email content, or any other details you want to verify..."
              className="mt-1.5 min-h-[100px]"
            />
          </div>
          <Button onClick={handleCheck} disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking legitimacy...</>
            ) : (
              <><ShieldAlert className="mr-2 h-4 w-4" /> Check Scholarship</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && !result.error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {(() => {
            const cfg = verdictConfig[result.verdict] || verdictConfig.suspicious;
            const Icon = cfg.icon;
            return (
              <Card className={`shadow-card ${cfg.border}`}>
                <CardContent className="p-6 text-center">
                  <Icon className={`h-12 w-12 mx-auto ${cfg.color}`} />
                  <Badge className={`${cfg.badgeClass} mt-3 text-sm px-4 py-1.5 rounded-full font-semibold`}>
                    {cfg.label}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{result.explanation}</p>
                  <p className="text-xs text-muted-foreground mt-2">Confidence: {result.confidence}%</p>
                </CardContent>
              </Card>
            );
          })()}

          {/* Analysis Grid */}
          {result.analysis && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(analysisIcons).map(([key, { icon: Icon, label }]) => {
                const value = result.analysis[key as keyof typeof result.analysis];
                const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
                const isGood = value === "safe" || value === "legitimate" || value === "none" || value === true;
                return (
                  <Card key={key} className="shadow-card">
                    <CardContent className="p-3 text-center">
                      <Icon className={`h-5 w-5 mx-auto ${isGood ? "text-emerald-500" : "text-amber-500"}`} />
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      <p className={`text-xs font-semibold mt-0.5 capitalize ${isGood ? "text-emerald-600" : "text-amber-600"}`}>
                        {displayValue}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Green Flags */}
            {result.greenFlags?.length > 0 && (
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Positive Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {result.greenFlags.map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-emerald-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Red Flags */}
            {result.redFlags?.length > 0 && (
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <XOctagon className="h-4 w-4 text-red-500" /> Red Flags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {result.redFlags.map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500">✗</span> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendation */}
          {result.recommendation && (
            <Card className="shadow-card border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">Recommendation</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
