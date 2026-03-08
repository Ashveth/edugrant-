import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, IndianRupee, Clock, Brain, ExternalLink, CheckCircle2, Circle, FileText, Sparkles, TrendingUp, Users, Upload, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SuccessBadge } from "@/components/SuccessBadge";
import { useApp } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";
import { matchScholarships } from "@/lib/matchingEngine";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocCheckItem {
  document_name: string;
  is_completed: boolean;
  file_path: string | null;
}

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const { profile, savedScholarships, toggleSaved, userId } = useApp();
  const { toast } = useToast();

  const scholarship = scholarships.find(s => s.id === id);
  if (!scholarship) return <div className="text-center py-20 text-muted-foreground">Scholarship not found.</div>;

  const match = profile ? matchScholarships(profile, [scholarship])[0] : null;
  const days = Math.max(0, Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / 86400000));
  const isSaved = savedScholarships.includes(scholarship.id);

  const competitionPercent = scholarship.competitionLevel === "High" ? 85 : scholarship.competitionLevel === "Medium" ? 55 : 25;

  // Document checklist state from DB
  const [docChecklist, setDocChecklist] = useState<DocCheckItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!userId || !id) return;
    const load = async () => {
      setLoadingDocs(true);
      const { data } = await supabase
        .from("scholarship_doc_checklist")
        .select("document_name, is_completed, file_path")
        .eq("user_id", userId)
        .eq("scholarship_id", id);

      const existing = new Map((data || []).map(d => [d.document_name, d]));
      const merged = scholarship.requiredDocuments.map(doc => existing.get(doc) || { document_name: doc, is_completed: false, file_path: null });
      setDocChecklist(merged);
      setLoadingDocs(false);
    };
    load();
  }, [userId, id, scholarship.requiredDocuments]);

  const completedCount = docChecklist.filter(d => d.is_completed).length;
  const totalDocs = docChecklist.length;
  const progressPercent = totalDocs > 0 ? Math.round((completedCount / totalDocs) * 100) : 0;

  const toggleDocComplete = async (docName: string) => {
    if (!userId || !id) return;
    const current = docChecklist.find(d => d.document_name === docName);
    const newCompleted = !(current?.is_completed);

    setDocChecklist(prev => prev.map(d => d.document_name === docName ? { ...d, is_completed: newCompleted } : d));

    await supabase.from("scholarship_doc_checklist").upsert({
      user_id: userId,
      scholarship_id: id,
      document_name: docName,
      is_completed: newCompleted,
      file_path: current?.file_path || null,
    }, { onConflict: "user_id,scholarship_id,document_name" });
  };

  const handleFileUpload = async (docName: string, file: File) => {
    if (!userId || !id) return;
    setUploadingDoc(docName);
    try {
      const filePath = `${userId}/${id}/${docName}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from("user-documents").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      setDocChecklist(prev => prev.map(d => d.document_name === docName ? { ...d, is_completed: true, file_path: filePath } : d));

      await supabase.from("scholarship_doc_checklist").upsert({
        user_id: userId,
        scholarship_id: id,
        document_name: docName,
        is_completed: true,
        file_path: filePath,
      }, { onConflict: "user_id,scholarship_id,document_name" });

      toast({ title: `${docName} uploaded successfully` });
    } catch (e) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setUploadingDoc(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <Link to="/dashboard/scholarships" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Scholarships
      </Link>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Info */}
        <div className="flex-1 space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {match && (
                  <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    <Sparkles className="h-3 w-3" /> {match.matchPercentage}% Match
                  </span>
                )}
                {match && <SuccessBadge probability={match.approvalProbability} />}
                <Badge variant={days <= 14 ? "destructive" : "secondary"}>
                  <Clock className="mr-1 h-3 w-3" /> {days}d left
                </Badge>
                <Badge variant="outline">{scholarship.competitionLevel} Competition</Badge>
                <Badge variant="outline">{scholarship.providerType}</Badge>
              </div>
              <CardTitle className="font-display text-xl">{scholarship.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold font-display text-foreground">₹{scholarship.amount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">{scholarship.description}</p>

              {/* Eligibility */}
              <div>
                <h3 className="font-display text-sm font-semibold mb-2">Eligibility Criteria</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {scholarship.eligibility.maxIncome && <div className="bg-muted rounded-lg p-2"><span className="text-muted-foreground">Max Income:</span> <span className="font-medium">₹{(scholarship.eligibility.maxIncome / 100000).toFixed(0)}L</span></div>}
                  {scholarship.eligibility.minPercentage && <div className="bg-muted rounded-lg p-2"><span className="text-muted-foreground">Min Marks:</span> <span className="font-medium">{scholarship.eligibility.minPercentage}%</span></div>}
                  {scholarship.eligibility.categories && scholarship.eligibility.categories.length < 4 && <div className="bg-muted rounded-lg p-2"><span className="text-muted-foreground">Categories:</span> <span className="font-medium">{scholarship.eligibility.categories.join(", ")}</span></div>}
                  {scholarship.eligibility.educationLevels && <div className="bg-muted rounded-lg p-2"><span className="text-muted-foreground">Levels:</span> <span className="font-medium">{scholarship.eligibility.educationLevels.join(", ")}</span></div>}
                </div>
              </div>

              <div className="flex gap-2">
                <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow">
                    <ExternalLink className="mr-2 h-4 w-4" /> Apply Now
                  </Button>
                </a>
                <Button variant="outline" onClick={() => toggleSaved(scholarship.id)}>
                  {isSaved ? "Unsave" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Explanation */}
          {match && (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Match Explanation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {match.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">✓</span><span>{r}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Tips */}
          {match && match.approvalProbability < 70 && (
            <Card className="shadow-card border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-600" /> Tips to Improve Your Chances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {match.approvalProbability < 40 && (
                  <p className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-amber-500 mt-0.5">💡</span> Consider adding volunteer work or leadership experience to strengthen your profile.</p>
                )}
                {match.meritScore < 60 && (
                  <p className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-amber-500 mt-0.5">📚</span> Improving your academic percentage could significantly boost your approval chances.</p>
                )}
                {match.financialNeedScore < 50 && (
                  <p className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-amber-500 mt-0.5">📋</span> Make sure your income certificate is up to date to maximize financial need score.</p>
                )}
                <p className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-amber-500 mt-0.5">✍️</span> A strong Statement of Purpose can make the difference — use our AI Essay Generator to craft one.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-72 space-y-4">
          {/* Approval Probability */}
          {match && (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Approval Probability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={match.approvalProbability >= 70 ? "hsl(var(--success))" : match.approvalProbability >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} strokeWidth="3" strokeDasharray={`${match.approvalProbability}, 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg">{match.approvalProbability}%</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center"><p className="text-muted-foreground">Merit</p><p className="font-bold">{match.meritScore}%</p></div>
                  <div className="text-center"><p className="text-muted-foreground">Need</p><p className="font-bold">{match.financialNeedScore}%</p></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competition Insight */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Competition Insight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{scholarship.competitionLevel} Competition</span>
                <span className="font-semibold">{competitionPercent}%</span>
              </div>
              <Progress value={competitionPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {scholarship.competitionLevel === "Low" ? "Few applicants — great chance!" : scholarship.competitionLevel === "Medium" ? "Moderate applicants — solid opportunity" : "Many applicants — strengthen your application"}
              </p>
            </CardContent>
          </Card>

          {/* Enhanced Required Documents with progress, upload, DB persistence */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Required Documents</CardTitle>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{completedCount}/{totalDocs} ready</span>
                <span className="text-xs font-semibold text-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5 mt-1" />
            </CardHeader>
            <CardContent className="space-y-1">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                docChecklist.map((doc) => (
                  <div key={doc.document_name} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors group">
                    <button onClick={() => toggleDocComplete(doc.document_name)} className="shrink-0">
                      {doc.is_completed
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        : <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </button>
                    <span className={`flex-1 text-xs ${doc.is_completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {doc.document_name}
                      {doc.file_path && <span className="text-[10px] text-emerald-500 ml-1">✓ uploaded</span>}
                    </span>
                    <input
                      type="file"
                      ref={(el) => { fileInputRefs.current[doc.document_name] = el; }}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.document_name, file);
                      }}
                    />
                    <button
                      onClick={() => fileInputRefs.current[doc.document_name]?.click()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      disabled={uploadingDoc === doc.document_name}
                    >
                      {uploadingDoc === doc.document_name
                        ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        : <Upload className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      }
                    </button>
                  </div>
                ))
              )}
              {completedCount < totalDocs && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 pt-2 px-2">
                  💡 Complete all documents before applying to increase your chances.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
