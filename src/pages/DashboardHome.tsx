import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, BookOpen, User, Bookmark, Sparkles, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";
import { matchScholarships } from "@/lib/matchingEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function DashboardHome() {
  const { profile, savedScholarships } = useApp();

  const matches = profile ? matchScholarships(profile, scholarships) : [];
  const topMatches = matches.slice(0, 3);
  const avgMatch = matches.length > 0 ? Math.round(matches.reduce((s, m) => s + m.matchPercentage, 0) / matches.length) : 0;

  const statCards = [
    { icon: Target, label: "Scholarships Matched", value: matches.length, color: "text-accent" },
    { icon: TrendingUp, label: "Avg Match Score", value: `${avgMatch}%`, color: "text-success" },
    { icon: Bookmark, label: "Saved Scholarships", value: savedScholarships.length, color: "text-info" },
    { icon: Clock, label: "Upcoming Deadlines", value: matches.filter(m => { const d = new Date(m.scholarship.deadline); return d > new Date() && d < new Date(Date.now() + 30 * 86400000); }).length, color: "text-warning" },
  ];

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
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="flex items-center gap-4 p-6">
              <AlertCircle className="h-8 w-8 text-accent shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">Complete Your Profile</p>
                <p className="text-sm text-muted-foreground">Fill in your academic and personal details to get AI-powered scholarship matches.</p>
              </div>
              <Link to="/dashboard/profile">
                <Button className="gradient-gold text-accent-foreground font-semibold shadow-gold">
                  <User className="mr-2 h-4 w-4" /> Set Up Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
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
            <Link to="/dashboard/scholarships">
              <Button variant="ghost" size="sm">View All →</Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {topMatches.map((m, i) => (
              <motion.div key={m.scholarship.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                        <Sparkles className="h-3 w-3" /> {m.matchPercentage}% Match
                      </span>
                      <span className="text-xs text-muted-foreground">₹{(m.scholarship.amount / 1000).toFixed(0)}K</span>
                    </div>
                    <CardTitle className="text-sm font-display leading-tight">{m.scholarship.name}</CardTitle>
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

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: "/dashboard/scholarships", icon: Target, label: "Find Scholarships", desc: "AI-powered matching" },
          { to: "/dashboard/essay", icon: BookOpen, label: "Essay Generator", desc: "AI-drafted essays" },
          { to: "/dashboard/saved", icon: Bookmark, label: "Saved Scholarships", desc: `${savedScholarships.length} saved` },
        ].map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer group">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl gradient-gold p-3 group-hover:shadow-gold transition-shadow">
                  <a.icon className="h-5 w-5 text-accent-foreground" />
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
