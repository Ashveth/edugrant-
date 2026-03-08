import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckSquare, Square, IndianRupee, Clock, Sparkles, AlertCircle, Loader2, ArrowRight, ArrowLeft, User, FileText, GraduationCap, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { SuccessBadge } from "@/components/SuccessBadge";
import { useApp } from "@/context/AppContext";
import { useScholarshipsFromDB } from "@/hooks/useScholarshipsFromDB";
import { matchScholarships } from "@/lib/matchingEngine";
import { useToast } from "@/hooks/use-toast";

function getDeadlineDays(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

type Step = "select" | "review" | "applying" | "done";

export default function BulkApplyPage() {
  const { profile, savedScholarships, applications, addApplication, documentChecklist } = useApp();
  const { scholarships } = useScholarshipsFromDB();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<Step>("select");
  const [applyProgress, setApplyProgress] = useState(0);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const matches = useMemo(() => profile ? matchScholarships(profile, scholarships) : [], [profile]);

  // Filter out already-applied scholarships
  const appliedScholarshipIds = new Set(applications.map(a => a.scholarship_id));
  const availableMatches = matches.filter(m => !appliedScholarshipIds.has(m.scholarship.id));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === availableMatches.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(availableMatches.map(m => m.scholarship.id)));
    }
  };

  const selectedMatches = availableMatches.filter(m => selected.has(m.scholarship.id));
  const totalAmount = selectedMatches.reduce((s, m) => s + m.scholarship.amount, 0);

  // Profile completion check
  const profileFields = profile ? [profile.fullName, profile.age, profile.gender, profile.category, profile.annualFamilyIncome, profile.academicPercentage, profile.educationLevel, profile.fieldOfStudy, profile.state, profile.targetCourseCost] : [];
  const filledFields = profileFields.filter(f => f !== undefined && f !== "" && f !== 0).length;
  const profileStrength = profile ? Math.round((filledFields / 10) * 100) : 0;

  const allDocs = ["Income Certificate", "Marksheets", "Aadhaar Card", "Recommendation Letter", "Caste Certificate", "Domicile Certificate"];
  const readyDocs = allDocs.filter(d => documentChecklist[d]).length;

  const handleBulkApply = async () => {
    setStep("applying");
    const ids = Array.from(selected);
    setApplyProgress(0);

    const results: string[] = [];
    for (let i = 0; i < ids.length; i++) {
      await addApplication(ids[i]);
      results.push(ids[i]);
      setApplyProgress(Math.round(((i + 1) / ids.length) * 100));
      // Small delay for UX
      await new Promise(r => setTimeout(r, 300));
    }

    setAppliedIds(results);
    setStep("done");
    toast({ title: `${results.length} applications created successfully!` });
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5">
          <AlertCircle className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">Profile Required</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">Complete your profile first to use bulk apply.</p>
        <Link to="/dashboard/profile">
          <Button className="mt-6 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl">Complete Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" /> Apply to Multiple Scholarships
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill your profile once and apply to multiple scholarships in minutes.
        </p>
      </div>

      {/* Highlight Banner */}
      <Card className="mb-6 border-primary/20 gradient-subtle rounded-2xl">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-xl gradient-primary p-3 shadow-glow shrink-0">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground text-sm">One Profile → Multiple Applications</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your profile and documents are auto-filled for every scholarship you apply to. Save hours of repetitive work.</p>
          </div>
          <div className="hidden sm:flex gap-4 text-center">
            <div>
              <p className="font-display text-lg font-bold text-foreground">{profileStrength}%</p>
              <p className="text-[10px] text-muted-foreground">Profile</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-foreground">{readyDocs}/{allDocs.length}</p>
              <p className="text-[10px] text-muted-foreground">Docs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "select", label: "Select" },
          { key: "review", label: "Review" },
          { key: "done", label: "Applied" },
        ].map((s, i) => {
          const isActive = step === s.key || (step === "applying" && s.key === "review");
          const isDone = (step === "review" && s.key === "select") || (step === "applying" && s.key === "select") || (step === "done" && s.key !== "done");
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-0.5 ${isDone || isActive ? "bg-primary" : "bg-muted"}`} />}
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${isActive ? "gradient-primary text-primary-foreground" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                <span>{i + 1}</span>
                <span>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Select Scholarships */}
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {availableMatches.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-display font-semibold text-foreground">No new scholarships to apply</p>
                <p className="text-sm text-muted-foreground mt-1">You've already started tracking all matched scholarships.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={selectAll}>
                      {selected.size === availableMatches.length ? "Deselect All" : "Select All"}
                    </Button>
                    <span className="text-sm text-muted-foreground">{selected.size} selected</span>
                  </div>
                  {selected.size > 0 && (
                    <Button onClick={() => setStep("review")} className="gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl gap-2">
                      Review Applications <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {availableMatches.map((m, i) => {
                    const s = m.scholarship;
                    const days = getDeadlineDays(s.deadline);
                    const isSelected = selected.has(s.id);

                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Card
                          className={`shadow-card rounded-2xl cursor-pointer transition-all ${isSelected ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "hover:border-border"}`}
                          onClick={() => toggleSelect(s.id)}
                        >
                          <CardContent className="flex items-center gap-4 p-4">
                            <Checkbox checked={isSelected} className="shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-display font-semibold text-foreground text-sm truncate">{s.name}</h3>
                                <SuccessBadge probability={m.approvalProbability} showLabel={false} />
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{s.provider}</p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-foreground flex items-center gap-0.5">
                                  <IndianRupee className="h-3.5 w-3.5 text-primary" />₹{s.amount.toLocaleString()}
                                </p>
                                <Badge variant={days <= 14 ? "destructive" : "secondary"} className="text-[10px] rounded-lg mt-1">
                                  <Clock className="mr-0.5 h-2.5 w-2.5" /> {days}d
                                </Badge>
                              </div>
                              <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                                <Sparkles className="h-2.5 w-2.5" /> {m.matchPercentage}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {selected.size > 0 && (
                  <div className="sticky bottom-4 mt-6">
                    <Card className="shadow-float rounded-2xl border-primary/20">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-display font-semibold text-foreground text-sm">{selected.size} scholarship{selected.size > 1 ? "s" : ""} selected</p>
                          <p className="text-xs text-muted-foreground">Total potential: ₹{totalAmount.toLocaleString()}</p>
                        </div>
                        <Button onClick={() => setStep("review")} className="gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl gap-2">
                          Review & Apply <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* STEP 2: Review */}
        {step === "review" && (
          <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="mb-2 text-muted-foreground gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to selection
            </Button>

            {/* Auto-filled Profile Summary */}
            <Card className="shadow-card rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Auto-filled Profile Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: "Name", value: profile.fullName },
                    { label: "Education", value: profile.educationLevel },
                    { label: "Field", value: profile.fieldOfStudy },
                    { label: "Percentage", value: `${profile.academicPercentage}%` },
                    { label: "Category", value: profile.category },
                    { label: "Income", value: `₹${(profile.annualFamilyIncome / 100000).toFixed(1)}L` },
                    { label: "State", value: profile.state },
                    { label: "Gender", value: profile.gender },
                  ].map(item => (
                    <div key={item.label} className="bg-muted rounded-lg p-2.5">
                      <span className="text-muted-foreground">{item.label}</span>
                      <p className="font-medium text-foreground mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents Status */}
            <Card className="shadow-card rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Documents Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Progress value={(readyDocs / allDocs.length) * 100} className="h-2 flex-1" />
                  <span className="text-xs font-semibold text-foreground">{readyDocs}/{allDocs.length}</span>
                </div>
                {readyDocs < allDocs.length && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Some documents are missing. <Link to="/dashboard/documents" className="underline text-primary">Upload now</Link>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected Scholarships */}
            <Card className="shadow-card rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" /> Applying to {selectedMatches.length} Scholarship{selectedMatches.length > 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedMatches.map(m => (
                  <div key={m.scholarship.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{m.scholarship.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.scholarship.provider}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-foreground">₹{m.scholarship.amount.toLocaleString()}</span>
                      <SuccessBadge probability={m.approvalProbability} showLabel={false} />
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Potential Funding</span>
                  <span className="font-display font-bold text-foreground">₹{totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleBulkApply} className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl h-12 text-base gap-2">
              <Zap className="h-5 w-5" /> Apply to {selectedMatches.length} Scholarship{selectedMatches.length > 1 ? "s" : ""}
            </Button>
          </motion.div>
        )}

        {/* STEP 3: Applying */}
        {step === "applying" && (
          <motion.div key="applying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="font-display font-semibold text-foreground text-lg">Preparing your applications with AI…</p>
            <p className="text-sm text-muted-foreground mt-1">Auto-filling scholarship forms…</p>
            <div className="max-w-xs mx-auto mt-6">
              <Progress value={applyProgress} className="h-2.5 rounded-full" />
              <p className="text-xs text-muted-foreground mt-2">{applyProgress}% complete</p>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Done */}
        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Zap className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Applications Created!</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {appliedIds.length} scholarship application{appliedIds.length > 1 ? "s have" : " has"} been created and added to your tracker.
            </p>
            <div className="flex gap-3 justify-center mt-8">
              <Button onClick={() => navigate("/dashboard/applications")} className="gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl gap-2">
                <ClipboardList className="h-4 w-4" /> View Applications
              </Button>
              <Button variant="outline" onClick={() => { setSelected(new Set()); setStep("select"); }} className="rounded-xl">
                Apply to More
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
