import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, BookOpen, User, Bookmark, Sparkles, TrendingUp, Clock, AlertCircle, CheckCircle2, Circle, FileText, IndianRupee, Flame, GraduationCap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";
import { matchScholarships } from "@/lib/matchingEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScholarshipScrollSection } from "@/components/ScholarshipScrollSection";

const allDocs = ["Income Certificate", "Marksheets", "Aadhaar Card", "Recommendation Letter", "Caste Certificate", "Domicile Certificate"];

function SemiCircleGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 42;
  const circumference = Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 100 55">
        <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" strokeLinecap="round" />
        <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="font-display text-3xl font-extrabold text-foreground -mt-5">{value}%</span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export default function DashboardHome() {
  const { profile, savedScholarships, toggleSaved, documentChecklist, toggleDocument } = useApp();

  const matches = useMemo(() => profile ? matchScholarships(profile, scholarships) : [], [profile]);
  const topMatches = matches.slice(0, 8);
  const avgMatch = matches.length > 0 ? Math.round(matches.reduce((s, m) => s + m.matchPercentage, 0) / matches.length) : 0;

  const profileFields = profile ? [profile.fullName, profile.age, profile.gender, profile.category, profile.annualFamilyIncome, profile.academicPercentage, profile.educationLevel, profile.fieldOfStudy, profile.state, profile.targetCourseCost] : [];
  const filledFields = profileFields.filter(f => f !== undefined && f !== "" && f !== 0).length;
  const profileStrength = profile ? Math.round((filledFields / 10) * 100) : 0;

  const totalCost = profile?.targetCourseCost || 0;
  const scholarshipPotential = matches.reduce((s, m) => s + (m.matchPercentage > 50 ? m.scholarship.amount : 0), 0);
  const fundingGap = Math.max(0, totalCost - scholarshipPotential);

  const upcomingDeadlines = useMemo(() => matches
    .filter(m => { const d = new Date(m.scholarship.deadline); return d > new Date() && d < new Date(Date.now() + 60 * 86400000); })
    .sort((a, b) => new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime())
    .slice(0, 5), [matches]);

  const avgApproval = matches.length > 0 ? Math.round(matches.reduce((s, m) => s + m.approvalProbability, 0) / matches.length) : 0;

  // Netflix-style sections
  const expiringSoon = useMemo(() => matches
    .filter(m => {
      const d = Math.ceil((new Date(m.scholarship.deadline).getTime() - Date.now()) / 86400000);
      return d > 0 && d <= 30;
    })
    .sort((a, b) => new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime())
    .slice(0, 10), [matches]);

  const topForField = useMemo(() => {
    if (!profile?.fieldOfStudy) return [];
    return matches
      .filter(m => m.scholarship.eligibility.fieldsOfStudy?.includes(profile.fieldOfStudy) || (m.scholarship.eligibility.fieldsOfStudy?.length === 0))
      .slice(0, 10);
  }, [matches, profile?.fieldOfStudy]);

  return (
    <div className="space-y-8 max-w-[1200px]">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome{profile ? `, ${profile.fullName.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {profile ? "Your scholarship command center" : "Complete your profile to get personalized matches"}
        </p>
      </div>

      {/* Profile CTA */}
      {!profile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 gradient-subtle rounded-2xl">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6">
              <div className="rounded-xl gradient-primary p-3 shadow-glow shrink-0">
                <AlertCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-foreground">Let's refine your profile to find better matches.</p>
                <p className="text-sm text-muted-foreground mt-1">Fill in your academic and personal details to unlock AI-powered recommendations.</p>
              </div>
              <Link to="/dashboard/profile">
                <Button className="gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl">
                  <User className="mr-2 h-4 w-4" /> Set Up Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top row: Gauge + Profile Strength + Financial Gap */}
      {profile && (
        <div className="grid gap-5 md:grid-cols-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-4">
            <Card className="shadow-card rounded-2xl h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 px-6">
                <SemiCircleGauge value={avgApproval} label="Avg. Approval Probability" color="hsl(var(--primary))" />
                <div className="flex gap-6 mt-5 text-center">
                  <div>
                    <p className="font-display text-xl font-bold text-foreground">{matches.length}</p>
                    <p className="text-[11px] text-muted-foreground">Matched</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div>
                    <p className="font-display text-xl font-bold text-foreground">{avgMatch}%</p>
                    <p className="text-[11px] text-muted-foreground">Avg Match</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="md:col-span-4">
            <Card className="shadow-card rounded-2xl h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Profile Strength</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="font-display text-4xl font-extrabold text-foreground">{profileStrength}<span className="text-lg text-muted-foreground">%</span></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profileStrength >= 80 ? "Strong — great matches ahead" : profileStrength >= 50 ? "Good start — keep going" : "Needs work — complete all fields"}
                  </p>
                </div>
                <Progress value={profileStrength} className="h-2 rounded-full" />
                <Link to="/dashboard/profile" className="block">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                    {profileStrength >= 80 ? "Review Profile" : "Complete Profile"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-4">
            <Card className="shadow-float rounded-2xl h-full border-primary/10 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" /> Financial Gap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Course Cost</span>
                    <span className="font-semibold text-foreground">₹{(totalCost / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Scholarship Potential</span>
                    <span className="font-semibold text-emerald-600">₹{(scholarshipPotential / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">Remaining Gap</span>
                    <span className="font-bold text-destructive">₹{(fundingGap / 100000).toFixed(1)}L</span>
                  </div>
                </div>
                <Progress value={totalCost > 0 ? Math.min(100, (scholarshipPotential / totalCost) * 100) : 0} className="h-2 rounded-full" />
                <p className="text-[11px] text-muted-foreground">{totalCost > 0 ? Math.min(100, Math.round((scholarshipPotential / totalCost) * 100)) : 0}% covered by scholarships</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Quick Stats */}
      {profile && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, label: "Matched", value: matches.length, accent: "bg-primary/8" },
            { icon: TrendingUp, label: "Avg Match", value: `${avgMatch}%`, accent: "bg-emerald-500/8" },
            { icon: Bookmark, label: "Saved", value: savedScholarships.length, accent: "bg-accent/8" },
            { icon: Clock, label: "Deadlines", value: upcomingDeadlines.length, accent: "bg-amber-500/8" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
              <Card className="shadow-card rounded-2xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`rounded-xl p-2.5 ${s.accent}`}>
                    <s.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold font-display text-foreground leading-none">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Netflix-style Recommendation Sections */}
      {topMatches.length > 0 && (
        <ScholarshipScrollSection
          title="Recommended for You"
          icon={<Sparkles className="h-5 w-5 text-primary" />}
          matches={topMatches}
          savedScholarships={savedScholarships}
          onToggleSave={toggleSaved}
          viewAllLink="/dashboard/scholarships"
        />
      )}

      {expiringSoon.length > 0 && (
        <ScholarshipScrollSection
          title="Expiring Soon"
          icon={<Flame className="h-5 w-5 text-destructive" />}
          matches={expiringSoon}
          savedScholarships={savedScholarships}
          onToggleSave={toggleSaved}
        />
      )}

      {topForField.length > 0 && (
        <ScholarshipScrollSection
          title={`Top for ${profile?.fieldOfStudy || "Your Field"}`}
          icon={<GraduationCap className="h-5 w-5 text-primary" />}
          matches={topForField}
          savedScholarships={savedScholarships}
          onToggleSave={toggleSaved}
        />
      )}

      {/* Document Checklist + Deadline Tracker */}
      <div className="grid gap-5 md:grid-cols-12">
        <Card className="shadow-card rounded-2xl md:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Document Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {allDocs.map((doc) => (
              <button key={doc} onClick={() => toggleDocument(doc)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left group">
                {documentChecklist[doc]
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 transition-transform group-hover:scale-110" />
                  : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 transition-transform group-hover:scale-110" />
                }
                <span className={documentChecklist[doc] ? "text-foreground font-medium" : "text-muted-foreground"}>{doc}</span>
              </button>
            ))}
            <p className="text-[11px] text-muted-foreground pt-2 px-3">{Object.values(documentChecklist).filter(Boolean).length}/{allDocs.length} documents ready</p>
          </CardContent>
        </Card>

        <Card className="shadow-card rounded-2xl md:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming deadlines — you're all caught up!</p>
              </div>
            ) : (
              upcomingDeadlines.map((m) => {
                const days = Math.max(0, Math.ceil((new Date(m.scholarship.deadline).getTime() - Date.now()) / 86400000));
                return (
                  <Link key={m.scholarship.id} to={`/dashboard/scholarship/${m.scholarship.id}`}>
                    <div className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-muted/60 transition-colors cursor-pointer">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{m.scholarship.name}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(m.scholarship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                      <Badge variant={days <= 14 ? "destructive" : days <= 30 ? "secondary" : "outline"} className="shrink-0 rounded-lg">
                        {days}d left
                      </Badge>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: "/dashboard/scholarships", icon: Target, label: "Find Scholarships", desc: "AI-powered matching engine" },
          { to: "/dashboard/essay", icon: BookOpen, label: "Essay Generator", desc: "Personalized drafts with AI" },
          { to: "/dashboard/strategy", icon: TrendingUp, label: "Financial Strategy", desc: "Funding breakdown & plan" },
        ].map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="shadow-card hover-lift rounded-2xl cursor-pointer group">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl gradient-primary p-3 group-hover:shadow-glow transition-shadow">
                  <a.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
