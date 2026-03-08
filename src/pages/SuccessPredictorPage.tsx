import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, ThumbsUp, ThumbsDown, Lightbulb, Shield, AlertTriangle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useScholarshipsFromDB } from "@/hooks/useScholarshipsFromDB";

interface PredictionResult {
  prediction: "high" | "moderate" | "low";
  percentage: number;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  reasoning: string;
  error?: string;
}

export default function SuccessPredictorPage() {
  const { profile } = useApp();
  const { toast } = useToast();
  const [selectedScholarship, setSelectedScholarship] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handlePredict = async () => {
    if (!selectedScholarship) {
      toast({ title: "Please select a scholarship", variant: "destructive" });
      return;
    }
    if (!profile) {
      toast({ title: "Please complete your profile first", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    const scholarship = scholarships.find((s) => s.id === selectedScholarship);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/success-predictor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ studentProfile: profile, scholarship }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Prediction failed");
      }

      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Prediction failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const predictionConfig = {
    high: { color: "text-emerald-600", bg: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", icon: Shield, label: "High Chance" },
    moderate: { color: "text-amber-600", bg: "bg-amber-500", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", icon: Target, label: "Moderate Chance" },
    low: { color: "text-red-600", bg: "bg-red-500", badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: AlertTriangle, label: "Low Chance" },
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" /> AI Success Predictor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a scholarship to predict your chances of approval based on your profile.
        </p>
      </div>

      {!profile && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Complete your student profile first for accurate predictions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Scholarship Selection */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4 space-y-4">
          <Select value={selectedScholarship} onValueChange={setSelectedScholarship}>
            <SelectTrigger>
              <SelectValue placeholder="Select a scholarship to evaluate..." />
            </SelectTrigger>
            <SelectContent>
              {scholarships.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} — ₹{s.amount.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handlePredict} disabled={loading || !profile} className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing your chances...</>
            ) : (
              <><TrendingUp className="mr-2 h-4 w-4" /> Predict My Chances</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && !result.error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Prediction Score */}
          {(() => {
            const cfg = predictionConfig[result.prediction] || predictionConfig.moderate;
            const Icon = cfg.icon;
            return (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Icon className={`h-6 w-6 ${cfg.color}`} />
                    <Badge className={`${cfg.badge} text-sm px-3 py-1 rounded-full font-semibold`}>{cfg.label}</Badge>
                  </div>
                  <p className={`text-5xl font-display font-bold ${cfg.color}`}>{result.percentage}%</p>
                  <p className="text-sm text-muted-foreground mt-2">Predicted success rate</p>
                  <Progress value={result.percentage} className="mt-4 h-3" />
                  <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">{result.reasoning}</p>
                </CardContent>
              </Card>
            );
          })()}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Strengths */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-emerald-500" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-500" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses?.map((w, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span> {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          {result.tips && result.tips.length > 0 && (
            <Card className="shadow-card border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" /> Tips to Improve Your Chances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
