import { useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, Upload, Loader2, CheckCircle2, User, GraduationCap, Trophy, Star, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  fullName?: string;
  gpa?: number;
  academicPercentage?: number;
  educationLevel?: string;
  fieldOfStudy?: string;
  skills?: string[];
  achievements?: string[];
  awards?: string[];
  activities?: string[];
  state?: string;
  summary?: string;
  error?: string;
}

export default function ProfileAnalyzerPage() {
  const { setProfile, profile } = useApp();
  const { toast } = useToast();
  const [documentText, setDocumentText] = useState("");
  const [documentType, setDocumentType] = useState("resume");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      toast({ title: "Please paste your document text", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile-analyzer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ documentText, documentType }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Profile analyzed successfully!" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Analysis failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const applyToProfile = () => {
    if (!result) return;
    const updated = {
      fullName: result.fullName || profile?.fullName || "",
      age: profile?.age || 18,
      gender: profile?.gender || ("Male" as const),
      category: profile?.category || ("General" as const),
      annualFamilyIncome: profile?.annualFamilyIncome || 300000,
      academicPercentage: result.academicPercentage || result.gpa || profile?.academicPercentage || 75,
      educationLevel: (result.educationLevel as any) || profile?.educationLevel || "Undergraduate",
      fieldOfStudy: result.fieldOfStudy || profile?.fieldOfStudy || "Engineering",
      state: result.state || profile?.state || "Maharashtra",
      targetCourseCost: profile?.targetCourseCost || 500000,
    };
    setProfile(updated);
    toast({ title: "Profile updated with extracted data!" });
  };

  const sections = [
    { key: "skills", icon: Star, label: "Skills", color: "text-primary" },
    { key: "achievements", icon: Trophy, label: "Achievements", color: "text-amber-500" },
    { key: "awards", icon: GraduationCap, label: "Awards", color: "text-emerald-500" },
    { key: "activities", icon: Activity, label: "Activities", color: "text-violet-500" },
  ] as const;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <FileSearch className="h-6 w-6 text-primary" /> AI Profile Analyzer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your resume, marksheet, or certificate text — AI will extract your profile data automatically.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Document Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">Resume / CV</SelectItem>
                  <SelectItem value="marksheet">Marksheet</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste the text content of your document here..."
              className="min-h-[250px] text-sm"
            />
            <Button onClick={handleAnalyze} disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI analyzing your profile...</>
              ) : (
                <><FileSearch className="mr-2 h-4 w-4" /> Analyze Document</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="shadow-card border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-3 p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div>
                    <p className="font-display font-semibold text-foreground">Analyzing your document...</p>
                    <p className="text-xs text-muted-foreground">Extracting GPA, skills, achievements, and more</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result && !result.error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Summary */}
              <Card className="shadow-card border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-display font-semibold text-foreground">Analysis Complete</p>
                      {result.summary && <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Extracted Profile */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Extracted Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.fullName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium text-foreground">{result.fullName}</span>
                    </div>
                  )}
                  {(result.academicPercentage || result.gpa) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Academic Score</span>
                      <span className="font-medium text-foreground">{result.academicPercentage || result.gpa}%</span>
                    </div>
                  )}
                  {result.educationLevel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Education</span>
                      <span className="font-medium text-foreground">{result.educationLevel}</span>
                    </div>
                  )}
                  {result.fieldOfStudy && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Field</span>
                      <span className="font-medium text-foreground">{result.fieldOfStudy}</span>
                    </div>
                  )}
                  {result.state && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">State</span>
                      <span className="font-medium text-foreground">{result.state}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills, Achievements, etc. */}
              {sections.map(({ key, icon: Icon, label, color }) => {
                const items = result[key];
                if (!items || items.length === 0) return null;
                return (
                  <Card key={key} className="shadow-card">
                    <CardContent className="p-4">
                      <p className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
                        <Icon className={`h-4 w-4 ${color}`} /> {label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, i) => (
                          <Badge key={i} variant="secondary" className="rounded-lg text-xs">{item}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Button onClick={applyToProfile} className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Apply to My Profile
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
