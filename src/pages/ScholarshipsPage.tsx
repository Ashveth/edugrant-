import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Search, AlertCircle, Sparkles, Clock, Bookmark, BookmarkCheck, ExternalLink, ChevronDown, ChevronUp, IndianRupee, Brain, Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { scholarships, fieldsOfStudy, indianStates } from "@/data/scholarships";
import { matchScholarships } from "@/lib/matchingEngine";
import { MatchResult } from "@/types/scholarship";
import { SuccessBadge } from "@/components/SuccessBadge";

function getDeadlineDays(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function getBadgeEmoji(badge: string) {
  if (badge.includes("High Approval")) return "🔥";
  if (badge.includes("Coverage") || badge.includes("Funding")) return "💰";
  if (badge.includes("Match")) return "🎯";
  if (badge.includes("Competitive")) return "⚠️";
  return "✨";
}

function ScholarshipCard({ match, isSaved, onToggleSave }: { match: MatchResult; isSaved: boolean; onToggleSave: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { scholarship: s, matchPercentage, financialNeedScore, meritScore, approvalProbability, reasons, badges } = match;
  const days = getDeadlineDays(s.deadline);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-card hover-lift rounded-2xl transition-all overflow-hidden border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground shadow-sm">
                  <Sparkles className="h-3 w-3" /> {matchPercentage}%
                </span>
                <Badge variant={days <= 14 ? "destructive" : "secondary"} className={`rounded-lg text-[11px] ${days <= 30 && days > 14 ? "bg-warning/10 text-warning border-warning/30" : ""}`}>
                  <Clock className="mr-1 h-3 w-3" /> {days === 0 ? "Today!" : `${days}d left`}
                </Badge>
              </div>
              <CardTitle className="text-base font-display leading-tight">{s.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{s.provider}</p>
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.map(b => <span key={b} className="text-[10px] font-medium bg-muted/80 text-muted-foreground px-2 py-0.5 rounded-full">{getBadgeEmoji(b)} {b}</span>)}
                </div>
                )}
                <SuccessBadge probability={approvalProbability} showLabel={false} />
            <button onClick={onToggleSave} className="shrink-0 text-primary hover:scale-110 transition-transform p-1">
              {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">₹{s.amount.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { label: "Merit", value: meritScore, color: "bg-primary" },
              { label: "Need", value: financialNeedScore, color: "bg-accent" },
              { label: "Approval", value: approvalProbability, color: "bg-success" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}%</span>
                </div>
                <Progress value={value} className="h-1.5 rounded-full" />
              </div>
            ))}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Brain className="h-3 w-3" /> AI Reasoning {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="rounded-xl bg-muted/50 border border-border/50 p-3 space-y-1.5">
                  {reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-primary mt-0.5">✓</span><span>{r}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-2">
            <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl" size="sm">
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Apply Now
              </Button>
            </a>
            <Link to={`/dashboard/scholarship/${s.id}`}>
              <Button variant="outline" size="sm" className="rounded-xl">Details</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ScholarshipsPage() {
  const { profile, savedScholarships, toggleSaved } = useApp();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterField, setFilterField] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterCompetition, setFilterCompetition] = useState("all");
  const [filterEducation, setFilterEducation] = useState("all");

  const matches = useMemo(() => (profile ? matchScholarships(profile, scholarships) : []), [profile]);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const s = m.scholarship;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.provider.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory !== "all" && s.eligibility.categories && !s.eligibility.categories.includes(filterCategory)) return false;
      if (filterField !== "all" && s.eligibility.fieldsOfStudy && s.eligibility.fieldsOfStudy.length > 0 && !s.eligibility.fieldsOfStudy.includes(filterField)) return false;
      if (filterState !== "all" && s.eligibility.states && s.eligibility.states.length > 0 && !s.eligibility.states.includes(filterState)) return false;
      if (filterCompetition !== "all" && s.competitionLevel !== filterCompetition) return false;
      if (filterEducation !== "all" && s.eligibility.educationLevels && !s.eligibility.educationLevels.includes(filterEducation)) return false;
      return true;
    });
  }, [matches, search, filterCategory, filterField, filterState, filterCompetition, filterEducation]);

  const hasActiveFilters = filterCategory !== "all" || filterField !== "all" || filterState !== "all" || filterCompetition !== "all" || filterEducation !== "all";
  const activeFilterCount = [filterCategory, filterField, filterState, filterCompetition, filterEducation].filter(f => f !== "all").length;

  const clearFilters = () => {
    setFilterCategory("all"); setFilterField("all"); setFilterState("all"); setFilterCompetition("all"); setFilterEducation("all");
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl gradient-subtle flex items-center justify-center mb-5">
          <AlertCircle className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">Profile Required</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">Complete your student profile so our AI can match you with scholarships you're most likely to get.</p>
        <Link to="/dashboard/profile">
          <Button className="mt-6 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl">Complete Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* Header with search */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground flex items-center gap-2.5">
              <Target className="h-6 w-6 text-primary" /> Scholarship Matches
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {filtered.length} scholarship{filtered.length !== 1 ? "s" : ""} matched to your profile
            </p>
          </div>
        </div>

        {/* Search bar — prominent, standalone */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search by scholarship name, provider..."
              className="pl-11 pr-4 h-11 rounded-2xl border-border/60 bg-card shadow-search focus:shadow-glow/20 focus:border-primary/40 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-2xl h-11 px-4 gap-2 font-medium transition-all ${showFilters ? "gradient-primary text-primary-foreground shadow-glow" : "border-border/60"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="shrink-0 overflow-hidden hidden md:block">
              <Card className="shadow-card sticky top-6 rounded-2xl border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-primary" /> Filters
                    </CardTitle>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
                        Clear all
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
                  {[
                    { label: "Category", value: filterCategory, onChange: setFilterCategory, options: ["General","OBC","SC","ST"] },
                    { label: "Field of Study", value: filterField, onChange: setFilterField, options: fieldsOfStudy },
                    { label: "Education Level", value: filterEducation, onChange: setFilterEducation, options: ["High School","Undergraduate","Postgraduate","Doctorate"] },
                    { label: "Competition", value: filterCompetition, onChange: setFilterCompetition, options: ["Low","Medium","High"] },
                    { label: "State", value: filterState, onChange: setFilterState, options: indianStates },
                  ].map(f => (
                    <div key={f.label}>
                      <Label className="text-xs text-muted-foreground font-medium">{f.label}</Label>
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className="mt-1.5 h-9 text-xs rounded-xl border-border/60 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {f.label}s</SelectItem>
                          {f.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1">
          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Active:</span>
              {filterCategory !== "all" && <Badge variant="secondary" className="text-xs gap-1 rounded-full px-3 py-1 bg-primary/8 text-primary border-primary/15">{filterCategory} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCategory("all")} /></Badge>}
              {filterField !== "all" && <Badge variant="secondary" className="text-xs gap-1 rounded-full px-3 py-1 bg-primary/8 text-primary border-primary/15">{filterField} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterField("all")} /></Badge>}
              {filterEducation !== "all" && <Badge variant="secondary" className="text-xs gap-1 rounded-full px-3 py-1 bg-primary/8 text-primary border-primary/15">{filterEducation} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterEducation("all")} /></Badge>}
              {filterCompetition !== "all" && <Badge variant="secondary" className="text-xs gap-1 rounded-full px-3 py-1 bg-primary/8 text-primary border-primary/15">{filterCompetition} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCompetition("all")} /></Badge>}
              {filterState !== "all" && <Badge variant="secondary" className="text-xs gap-1 rounded-full px-3 py-1 bg-primary/8 text-primary border-primary/15">{filterState} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterState("all")} /></Badge>}
              <button onClick={clearFilters} className="text-xs text-destructive hover:underline ml-1">Clear all</button>
            </div>
          )}

          {/* Results grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m) => (
              <ScholarshipCard key={m.scholarship.id} match={m} isSaved={savedScholarships.includes(m.scholarship.id)} onToggleSave={() => toggleSaved(m.scholarship.id)} />
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl gradient-subtle flex items-center justify-center mx-auto mb-5">
                <Search className="h-7 w-7 text-primary/40" />
              </div>
              <p className="font-display font-bold text-foreground text-lg mb-1.5">No matches found</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">Let's refine your filters to find better matches for your profile.</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-5 rounded-xl">
                  <X className="mr-2 h-3.5 w-3.5" /> Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
