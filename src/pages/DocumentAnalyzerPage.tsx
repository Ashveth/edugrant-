import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSearch, RotateCcw, Download, ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DOC_TYPES = [
  { value: "Academic Marksheet / Transcript", label: "Academic Marksheet / Transcript" },
  { value: "Income Certificate", label: "Income Certificate" },
  { value: "ID Proof / Passport", label: "ID Proof / Passport" },
  { value: "Recommendation Letter", label: "Recommendation Letter" },
  { value: "Certificate", label: "Certificate" },
  { value: "Resume / CV", label: "Resume / CV" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface AnalysisResult {
  verdict: "verified" | "suspicious" | "potentially_fake";
  confidence: number;
  redFlags: string[];
  greenFlags: string[];
  analysis: {
    textMetadata: { status: string; details: string };
    imageManipulation: { status: string; details: string };
    dataConsistency: { status: string; details: string };
    formatStructure: { status: string; details: string };
  };
  explanation: string;
  recommendation: string;
  error?: string;
}

export default function DocumentAnalyzerPage() {
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((f: File) => {
    if (f.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      toast({ title: "Unsupported format", description: "Please upload an image or PDF file.", variant: "destructive" });
      return;
    }
    setFile(f);
    setResult(null);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const analyze = async () => {
    if (!file || !docType) {
      toast({ title: "Missing info", description: "Please select a document type and upload a file.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const base64 = await toBase64(file);
      const { data, error } = await supabase.functions.invoke("document-analyzer", {
        body: { fileBase64: base64, fileType: file.type, documentCategory: docType },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Analysis failed", description: data.error, variant: "destructive" });
      } else {
        setResult(data);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const lines = [
      "=== DOCUMENT VERIFICATION REPORT ===",
      `Document Type: ${docType}`,
      `File: ${file?.name}`,
      `Date: ${new Date().toLocaleString()}`,
      "",
      `VERDICT: ${result.verdict?.toUpperCase().replace("_", " ")}`,
      `Confidence: ${result.confidence}%`,
      "",
      "--- Explanation ---",
      result.explanation,
      "",
      "--- Green Flags ---",
      ...(result.greenFlags?.map((f) => `  ✅ ${f}`) || []),
      "",
      "--- Red Flags ---",
      ...(result.redFlags?.map((f) => `  ❌ ${f}`) || []),
      "",
      "--- Analysis Breakdown ---",
      `Text & Metadata: ${result.analysis?.textMetadata?.status} — ${result.analysis?.textMetadata?.details}`,
      `Image Manipulation: ${result.analysis?.imageManipulation?.status} — ${result.analysis?.imageManipulation?.details}`,
      `Data Consistency: ${result.analysis?.dataConsistency?.status} — ${result.analysis?.dataConsistency?.details}`,
      `Format & Structure: ${result.analysis?.formatStructure?.status} — ${result.analysis?.formatStructure?.details}`,
      "",
      "--- Recommendation ---",
      result.recommendation,
      "",
      "Generated by EduGrant AI — Document Analyzer",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const verdictConfig = {
    verified: { icon: ShieldCheck, label: "Verified Document", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", emoji: "🟢", badgeVariant: "default" as const },
    suspicious: { icon: ShieldAlert, label: "Suspicious Document", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", emoji: "🟡", badgeVariant: "secondary" as const },
    potentially_fake: { icon: ShieldX, label: "Potentially Fake Document", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800", emoji: "🔴", badgeVariant: "destructive" as const },
  };

  const statusIcon = (s: string) =>
    s === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
    s === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> :
    <XCircle className="h-4 w-4 text-red-500" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Document Analyzer</h1>
        <p className="text-muted-foreground mt-1">Upload documents to verify authenticity and detect potential fraud.</p>
      </div>

      {/* Benefits Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 pt-5 pb-4">
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            This verification helps maintain fairness and increases the credibility of scholarship applications. Our AI analyzes text, metadata, formatting, and image consistency to detect manipulation.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Document</CardTitle>
            <CardDescription>Select the document type and upload a file for analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue placeholder="Select document type" /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">PDF, JPG, PNG — Max 10MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            </div>

            <div className="flex gap-2">
              <Button onClick={analyze} disabled={loading || !file || !docType} className="flex-1">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><FileSearch className="h-4 w-4" /> Analyze Document</>}
              </Button>
              <Button variant="outline" onClick={reset} disabled={loading}><RotateCcw className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Analyzing document authenticity using AI…</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!loading && result && !result.error && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Verdict */}
                {(() => {
                  const vc = verdictConfig[result.verdict] || verdictConfig.suspicious;
                  const VerdictIcon = vc.icon;
                  return (
                    <Card className={`${vc.border} border-2`}>
                      <CardContent className={`flex items-center gap-4 py-5 ${vc.bg} rounded-lg`}>
                        <VerdictIcon className={`h-10 w-10 ${vc.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{vc.emoji}</span>
                            <h3 className={`font-bold text-lg ${vc.color}`}>{vc.label}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Confidence:</span>
                            <Progress value={result.confidence} className="flex-1 h-2" />
                            <span className="text-sm font-bold text-foreground">{result.confidence}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Explanation */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Summary</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{result.explanation}</p>
                  </CardContent>
                </Card>

                {/* Flags */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.greenFlags?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-600 dark:text-emerald-400">✅ Green Flags</CardTitle></CardHeader>
                      <CardContent><ul className="space-y-1.5">{result.greenFlags.map((f, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />{f}</li>)}</ul></CardContent>
                    </Card>
                  )}
                  {result.redFlags?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base text-red-600 dark:text-red-400">❌ Red Flags</CardTitle></CardHeader>
                      <CardContent><ul className="space-y-1.5">{result.redFlags.map((f, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />{f}</li>)}</ul></CardContent>
                    </Card>
                  )}
                </div>

                {/* Analysis Breakdown */}
                {result.analysis && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Analysis Breakdown</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { key: "textMetadata", label: "Text & Metadata" },
                        { key: "imageManipulation", label: "Image Manipulation" },
                        { key: "dataConsistency", label: "Data Consistency" },
                        { key: "formatStructure", label: "Format & Structure" },
                      ].map(({ key, label }) => {
                        const item = result.analysis[key as keyof typeof result.analysis];
                        if (!item) return null;
                        return (
                          <div key={key} className="flex items-start gap-2">
                            {statusIcon(item.status)}
                            <div>
                              <p className="text-sm font-medium text-foreground">{label}</p>
                              <p className="text-xs text-muted-foreground">{item.details}</p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Recommendation */}
                {result.recommendation && (
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Recommendation</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{result.recommendation}</p></CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadReport} className="flex-1"><Download className="h-4 w-4" /> Download Report</Button>
                  <Button variant="outline" onClick={reset} className="flex-1"><RotateCcw className="h-4 w-4" /> Analyze Another</Button>
                </div>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <FileSearch className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground">Upload a document and click Analyze to get started.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
