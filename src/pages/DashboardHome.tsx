import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, BookOpen, User, Bookmark, Sparkles, TrendingUp, Clock, AlertCircle, CheckCircle2, Circle, FileText, IndianRupee } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";
import { matchScholarships } from "@/lib/matchingEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const allDocs = ["Income Certificate", "Marksheets", "Aadhaar Card", "Recommendation Letter", "Caste Certificate", "Domicile Certificate"];

export default function DashboardHome() {
  const { profile, savedScholarships, documentChecklist, toggleDocument } = useApp();

  const matches = profile ? matchScholarships(profile, scholarships) : [];
  const topMatches = matches.slice(0, 3);
  const avgMatch = matches.length > 0 ? Math.round(matches.reduce((s, m) => s + m.matchPercentage, 0) / matches.length) : 0;

  // Profile strength
  const profileFields = profile ? [profile.fullName, profile.age, profile.gender, profile.category, profile.annualFamilyIncome, profile.academicPercentage, profile.educationLevel, profile.fieldOfStudy, profile.state, profile.targetCourseCost] : [];
  const filledFields = profileFields.filter(f => f !== undefined && f !== "" && f !== 0).length;
  const profileStrength = profile ? Math.round((filledFields / 10) * 100) : 0;

  // Financial gap
  const totalCost = profile?.targetCourseCost || 0;
  const scholarshipPotential = matches.reduce((s, m) => s + (m.matchPercentage > 50 ? m.scholarship.amount : 0), 0);
  const fundingGap = Math.max(0, totalCost - scholarshipPotential);

  // Upcoming deadlines
  const upcomingDeadlines = matches
    .filter(m => { const d = new Date(m.scholarship.deadline); return d > new Date() && d < new Date(Date.now() + 60 * 86400000); })
    .sort((a, b) => new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome{profile ? `, ${profile.fullName.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {profile ? "Here's your scholarship dashboard overview" : "Complete your profile to get personalized matches"}
        </p>
      </div>

      {!profile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 gradient-subtle">
            <CardContent className="flex items-center gap-4 p-6">
              <AlertCircle className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">Complete Your Profile</p>
                <p className="text-sm text-muted-foreground">Fill in your academic and personal details to get AI-powered scholarship matches.</p>
              </div>
              <Link to="/dashboard/profile">
                <Button className="gradient-primary text-primary-foreground font-semibold shadow-glow">
                  <User className="mr-2 h-4 w-4" /> Set Up Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Profile Strength + Financial Gap */}
      {profile && (
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Profile Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${profileStrength}, 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg">{profileStrength}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{profileStrength >= 80 ? "Strong Profile" : profileStrength >= 50 ? "Good Start" : "Needs Work"}</p>
                    <p>Complete all fields for better matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="shadow-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" /> Financial Gap Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-primary/5 p-2">
                    <p className="text-xs text-muted-foreground">Course Cost</p>
                    <p className="font-display font-bold text-foreground">₹{(totalCost / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="rounded-lg bg-success/10 p-2">
                    <p className="text-xs text-muted-foreground">Scholarship Potential</p>
                    <p className="font-display font-bold text-success">₹{(scholarshipPotential / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="rounded-lg bg-destructive/10 p-2">
                    <p className="text-xs text-muted-foreground">Funding Gap</p>
                    <p className="font-display font-bold text-destructive">₹{(fundingGap / 100000).toFixed(1)}L</p>
                  </div>
                </div>
                <Progress value={totalCost > 0 ? Math.min(100, (scholarshipPotential / totalCost) * 100) : 0} className="h-2" />
                <p className="text-xs text-muted-foreground">{totalCost > 0 ? Math.min(100, Math.round((scholarshipPotential / totalCost) * 100)) : 0}% of your course cost potentially covered</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Target, label: "Scholarships Matched", value: matches.length, color: "text-primary" },
          { icon: TrendingUp, label: "Avg Match Score", value: `${avgMatch}%`, color: "text-success" },
          { icon: Bookmark, label: "Saved Scholarships", value: savedScholarships.length, color: "text-accent" },
          { icon: Clock, label: "Upcoming Deadlines", value: upcomingDeadlines.length, color: "text-warning" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-xl bg-muted p-3 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Matches */}
      {topMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Top Scholarship Matches</h2>
            <Link to="/dashboard/scholarships"><Button variant="ghost" size="sm">View All →</Button></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {topMatches.map((m, i) => (
              <motion.div key={m.scholarship.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        <Sparkles className="h-3 w-3" /> {m.matchPercentage}% Match
                      </span>
                      <span className="text-xs text-muted-foreground">₹{(m.scholarship.amount / 1000).toFixed(0)}K</span>
                    </div>
                    <CardTitle className="text-sm font-display leading-tight">{m.scholarship.name}</CardTitle>
                    {m.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.badges.slice(0, 2).map(b => <Badge key={b} variant="secondary" className="text-[10px] px-1.5 py-0">{b}</Badge>)}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-muted-foreground">{m.scholarship.provider}</p>
                    <Progress value={m.matchPercentage} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Merit: {m.meritScore}%</span>
                      <span>Approval: {m.approvalProbability}%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Document Checklist + Deadline Tracker */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Document Checklist */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Document Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allDocs.map((doc) => (
              <button key={doc} onClick={() => toggleDocument(doc)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                {documentChecklist[doc] ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                <span className={documentChecklist[doc] ? "text-foreground" : "text-muted-foreground"}>{doc}</span>
              </button>
            ))}
            <p className="text-xs text-muted-foreground pt-1">{Object.values(documentChecklist).filter(Boolean).length}/{allDocs.length} documents ready</p>
          </CardContent>
        </Card>

        {/* Deadline Tracker */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming deadlines</p>
            ) : (
              upcomingDeadlines.map((m) => {
                const days = Math.max(0, Math.ceil((new Date(m.scholarship.deadline).getTime() - Date.now()) / 86400000));
                return (
                  <div key={m.scholarship.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{m.scholarship.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(m.scholarship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <Badge variant={days <= 14 ? "destructive" : days <= 30 ? "secondary" : "outline"} className="shrink-0">
                      {days}d left
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: "/dashboard/scholarships", icon: Target, label: "Find Scholarships", desc: "AI-powered matching" },
          { to: "/dashboard/essay", icon: BookOpen, label: "Essay Generator", desc: "AI-drafted essays" },
          { to: "/dashboard/strategy", icon: TrendingUp, label: "Financial Strategy", desc: "Funding breakdown" },
        ].map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer group">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl gradient-primary p-3 group-hover:shadow-glow transition-shadow">
                  <a.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
