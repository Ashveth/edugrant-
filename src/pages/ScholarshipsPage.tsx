import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Search, AlertCircle, Sparkles, Clock, Bookmark, BookmarkCheck, ExternalLink, ChevronDown, ChevronUp, IndianRupee, TrendingUp, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";
import { matchScholarships } from "@/lib/matchingEngine";
import { MatchResult } from "@/types/scholarship";

function getDeadlineDays(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = getDeadlineDays(deadline);
  const urgent = days <= 14;
  const soon = days <= 30;
  return (
    <Badge variant={urgent ? "destructive" : "secondary"} className={soon && !urgent ? "bg-warning/10 text-warning border-warning/30" : ""}>
      <Clock className="mr-1 h-3 w-3" />
      {days === 0 ? "Today!" : `${days} days left`}
    </Badge>
  );
}

function ScholarshipCard({ match, isSaved, onToggleSave }: { match: MatchResult; isSaved: boolean; onToggleSave: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { scholarship: s, matchPercentage, financialNeedScore, meritScore, approvalProbability, reasons } = match;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-card hover:shadow-card-hover transition-all overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 rounded-full gradient-gold px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                  <Sparkles className="h-3 w-3" /> {matchPercentage}%
                </span>
                <DeadlineBadge deadline={s.deadline} />
              </div>
              <CardTitle className="text-base font-display leading-tight">{s.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{s.provider}</p>
            </div>
            <button onClick={onToggleSave} className="shrink-0 text-accent hover:scale-110 transition-transform">
              {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="h-4 w-4 text-accent" />
            <span className="font-semibold text-foreground">₹{s.amount.toLocaleString()}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>

          {/* Score bars */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Merit</span>
                <span className="font-semibold">{meritScore}%</span>
              </div>
              <Progress value={meritScore} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Need</span>
                <span className="font-semibold">{financialNeedScore}%</span>
              </div>
              <Progress value={financialNeedScore} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Approval</span>
                <span className="font-semibold">{approvalProbability}%</span>
              </div>
              <Progress value={approvalProbability} className="h-1.5" />
            </div>
          </div>

          {/* Expandable AI reasons */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <Brain className="h-3 w-3" /> AI Reasoning {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg bg-muted p-3 space-y-1.5">
                  {reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-accent mt-0.5">✓</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button className="w-full gradient-gold text-accent-foreground font-semibold shadow-gold" size="sm">
            <ExternalLink className="mr-2 h-3.5 w-3.5" /> Apply Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ScholarshipsPage() {
  const { profile, savedScholarships, toggleSaved } = useApp();
  const [search, setSearch] = useState("");

  const matches = useMemo(
    () => (profile ? matchScholarships(profile, scholarships) : []),
    [profile]
  );

  const filtered = useMemo(
    () =>
      matches.filter(
        (m) =>
          m.scholarship.name.toLowerCase().includes(search.toLowerCase()) ||
          m.scholarship.provider.toLowerCase().includes(search.toLowerCase())
      ),
    [matches, search]
  );

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-accent mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground">Profile Required</h2>
        <p className="mt-2 text-muted-foreground max-w-md">Complete your student profile first so our AI can match you with the best scholarships.</p>
        <Link to="/dashboard/profile">
          <Button className="mt-6 gradient-gold text-accent-foreground font-semibold shadow-gold">Complete Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-accent" /> Scholarship Matches
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} scholarships matched to your profile</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search scholarships..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <ScholarshipCard
            key={m.scholarship.id}
            match={m}
            isSaved={savedScholarships.includes(m.scholarship.id)}
            onToggleSave={() => toggleSaved(m.scholarship.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No scholarships found matching your search.
        </div>
      )}
    </div>
  );
}
