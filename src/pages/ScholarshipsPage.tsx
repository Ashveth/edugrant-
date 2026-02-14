import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Search, AlertCircle, Sparkles, Clock, Bookmark, BookmarkCheck, ExternalLink, ChevronDown, ChevronUp, IndianRupee, Brain, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { scholarships, fieldsOfStudy, indianStates } from "@/data/scholarships";
import { matchScholarships } from "@/lib/matchingEngine";
import { MatchResult } from "@/types/scholarship";

function getDeadlineDays(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function ScholarshipCard({ match, isSaved, onToggleSave }: { match: MatchResult; isSaved: boolean; onToggleSave: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { scholarship: s, matchPercentage, financialNeedScore, meritScore, approvalProbability, reasons, badges } = match;
  const days = getDeadlineDays(s.deadline);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-card hover:shadow-card-hover transition-all overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> {matchPercentage}%
                </span>
                <Badge variant={days <= 14 ? "destructive" : "secondary"} className={days <= 30 && days > 14 ? "bg-warning/10 text-warning border-warning/30" : ""}>
                  <Clock className="mr-1 h-3 w-3" /> {days === 0 ? "Today!" : `${days}d left`}
                </Badge>
                <Badge variant="outline" className="text-[10px]">{s.competitionLevel} Competition</Badge>
              </div>
              <CardTitle className="text-base font-display leading-tight">{s.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{s.provider}</p>
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.map(b => <span key={b} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{b}</span>)}
                </div>
              )}
            </div>
            <button onClick={onToggleSave} className="shrink-0 text-primary hover:scale-110 transition-transform">
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
              { label: "Merit", value: meritScore },
              { label: "Need", value: financialNeedScore },
              { label: "Approval", value: approvalProbability },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}%</span>
                </div>
                <Progress value={value} className="h-1.5" />
              </div>
            ))}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Brain className="h-3 w-3" /> AI Reasoning {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="rounded-lg bg-muted p-3 space-y-1.5">
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
            <Button className="flex-1 gradient-primary text-primary-foreground font-semibold shadow-glow" size="sm">
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> Apply Now
            </Button>
            <Link to={`/dashboard/scholarship/${s.id}`}>
              <Button variant="outline" size="sm">Details</Button>
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

  const clearFilters = () => {
    setFilterCategory("all"); setFilterField("all"); setFilterState("all"); setFilterCompetition("all"); setFilterEducation("all");
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-primary mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground">Profile Required</h2>
        <p className="mt-2 text-muted-foreground max-w-md">Complete your student profile first so our AI can match you with the best scholarships.</p>
        <Link to="/dashboard/profile">
          <Button className="mt-6 gradient-primary text-primary-foreground font-semibold shadow-glow">Complete Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" /> Scholarship Matches
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} scholarships matched to your profile</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant={showFilters ? "default" : "outline"} size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="shrink-0 overflow-hidden hidden md:block">
              <Card className="shadow-card sticky top-6">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-display">Filters</CardTitle>
                    {hasActiveFilters && <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {["General","OBC","SC","ST"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Field of Study</Label>
                    <Select value={filterField} onValueChange={setFilterField}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fields</SelectItem>
                        {fieldsOfStudy.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Education Level</Label>
                    <Select value={filterEducation} onValueChange={setFilterEducation}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {["High School","Undergraduate","Postgraduate","Doctorate"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Competition Level</Label>
                    <Select value={filterCompetition} onValueChange={setFilterCompetition}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {["Low","Medium","High"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State</Label>
                    <Select value={filterState} onValueChange={setFilterState}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1">
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {filterCategory !== "all" && <Badge variant="secondary" className="text-xs gap-1">{filterCategory} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCategory("all")} /></Badge>}
              {filterField !== "all" && <Badge variant="secondary" className="text-xs gap-1">{filterField} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterField("all")} /></Badge>}
              {filterEducation !== "all" && <Badge variant="secondary" className="text-xs gap-1">{filterEducation} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterEducation("all")} /></Badge>}
              {filterCompetition !== "all" && <Badge variant="secondary" className="text-xs gap-1">{filterCompetition} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCompetition("all")} /></Badge>}
              {filterState !== "all" && <Badge variant="secondary" className="text-xs gap-1">{filterState} <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterState("all")} /></Badge>}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m) => (
              <ScholarshipCard key={m.scholarship.id} match={m} isSaved={savedScholarships.includes(m.scholarship.id)} onToggleSave={() => toggleSaved(m.scholarship.id)} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No scholarships found matching your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
