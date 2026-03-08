import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, Sparkles, IndianRupee,
  Bookmark, BookmarkCheck, ExternalLink, Bell, BellOff, List, Grid3X3,
  CalendarRange, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuccessBadge } from "@/components/SuccessBadge";
import { useApp } from "@/context/AppContext";
import { useScholarshipsFromDB } from "@/hooks/useScholarshipsFromDB";
import { fieldsOfStudy } from "@/data/scholarships";
import { matchScholarships } from "@/lib/matchingEngine";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MatchResult } from "@/types/scholarship";

type ViewMode = "month" | "week" | "list";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDeadlineDays(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function getUrgencyConfig(days: number) {
  if (days <= 7) return { emoji: "🔴", label: "Deadline This Week", color: "text-destructive", bg: "bg-destructive/10" };
  if (days <= 21) return { emoji: "🟡", label: "Closing Soon", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" };
  return { emoji: "🟢", label: "Open", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function ScholarshipCalendarPage() {
  const { profile, savedScholarships, toggleSaved, userId, userEmail } = useApp();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterField, setFilterField] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [loadingReminders, setLoadingReminders] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const { scholarships } = useScholarshipsFromDB();
  const matches = useMemo(() => profile && scholarships.length > 0 ? matchScholarships(profile, scholarships) : [], [profile, scholarships]);

  // Filter scholarships
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const s = m.scholarship;
      if (filterField !== "all" && s.eligibility.fieldsOfStudy && s.eligibility.fieldsOfStudy.length > 0 && !s.eligibility.fieldsOfStudy.includes(filterField)) return false;
      if (filterLevel !== "all" && s.eligibility.educationLevels && !s.eligibility.educationLevels.includes(filterLevel)) return false;
      return true;
    });
  }, [matches, filterField, filterLevel]);

  // Group by deadline date
  const scholarshipsByDate = useMemo(() => {
    const map: Record<string, MatchResult[]> = {};
    filteredMatches.forEach(m => {
      const dateKey = m.scholarship.deadline.split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(m);
    });
    return map;
  }, [filteredMatches]);

  // Load reminders
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoadingReminders(true);
      const { data } = await supabase
        .from("scholarship_reminders")
        .select("scholarship_id")
        .eq("user_id", userId);
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach(r => { map[r.scholarship_id] = true; });
        setReminders(map);
      }
      setLoadingReminders(false);
    };
    load();
  }, [userId]);

  const toggleReminder = async (scholarshipId: string) => {
    if (!userId || !userEmail) return;
    const isSet = reminders[scholarshipId];

    if (isSet) {
      setReminders(prev => { const n = { ...prev }; delete n[scholarshipId]; return n; });
      await supabase.from("scholarship_reminders").delete().eq("user_id", userId).eq("scholarship_id", scholarshipId);
      toast({ title: "Reminder removed" });
    } else {
      setReminders(prev => ({ ...prev, [scholarshipId]: true }));
      await supabase.from("scholarship_reminders").upsert({
        user_id: userId,
        scholarship_id: scholarshipId,
        email: userEmail,
      }, { onConflict: "user_id,scholarship_id" });
      toast({ title: "Reminder set! You'll be notified before the deadline." });
    }
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + delta, 1));
  };

  const navigateWeek = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta * 7);
    setCurrentDate(d);
  };

  // Get week dates
  const getWeekDates = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const selectedMatch = selectedScholarshipId ? filteredMatches.find(m => m.scholarship.id === selectedScholarshipId) : null;

  // List view: sorted by deadline
  const listMatches = useMemo(() => {
    return [...filteredMatches]
      .filter(m => new Date(m.scholarship.deadline) >= new Date())
      .sort((a, b) => new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime());
  }, [filteredMatches]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5">
          <AlertCircle className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">Profile Required</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">Complete your profile to see personalized scholarship deadlines.</p>
        <Link to="/dashboard/profile">
          <Button className="mt-6 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl">Complete Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" /> Scholarship Calendar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Never miss a scholarship deadline again.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* View Mode */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {[
            { mode: "month" as ViewMode, icon: Grid3X3, label: "Month" },
            { mode: "week" as ViewMode, icon: CalendarRange, label: "Week" },
            { mode: "list" as ViewMode, icon: List, label: "List" },
          ].map(v => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === v.mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-1">
          <Select value={filterField} onValueChange={setFilterField}>
            <SelectTrigger className="h-9 text-xs rounded-xl flex-1 max-w-[160px]"><SelectValue placeholder="Field" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              {fieldsOfStudy.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="h-9 text-xs rounded-xl flex-1 max-w-[160px]"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {["High School", "Undergraduate", "Postgraduate", "Doctorate"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Calendar Area */}
        <div className="flex-1">
          {/* Month Navigation */}
          {(viewMode === "month" || viewMode === "week") && (
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={() => viewMode === "month" ? navigateMonth(-1) : navigateWeek(-1)} className="rounded-xl">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-display font-bold text-foreground">
                {viewMode === "month"
                  ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
                  : `Week of ${currentDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                }
              </h2>
              <Button variant="ghost" size="sm" onClick={() => viewMode === "month" ? navigateMonth(1) : navigateWeek(1)} className="rounded-xl">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* MONTH VIEW */}
          {viewMode === "month" && (
            <Card className="shadow-card rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-border">
                  {DAY_NAMES.map(d => (
                    <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {(() => {
                    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
                    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
                    const cells = [];

                    // Empty cells before first day
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-border/50 bg-muted/20" />);
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const dayScholarships = scholarshipsByDate[dateStr] || [];
                      const isToday = new Date().toISOString().split("T")[0] === dateStr;

                      cells.push(
                        <div
                          key={day}
                          className={`min-h-[80px] border-b border-r border-border/50 p-1 transition-colors hover:bg-muted/30 ${isToday ? "bg-primary/5" : ""}`}
                        >
                          <span className={`text-xs font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : "text-muted-foreground px-1"}`}>
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {dayScholarships.slice(0, 3).map(m => {
                              const days = getDeadlineDays(m.scholarship.deadline);
                              const urgency = getUrgencyConfig(days);
                              return (
                                <button
                                  key={m.scholarship.id}
                                  onClick={() => setSelectedScholarshipId(m.scholarship.id)}
                                  className={`w-full text-left text-[9px] font-medium px-1 py-0.5 rounded truncate ${urgency.bg} ${urgency.color} hover:opacity-80 transition-opacity`}
                                >
                                  {urgency.emoji} {m.scholarship.name}
                                </button>
                              );
                            })}
                            {dayScholarships.length > 3 && (
                              <span className="text-[9px] text-muted-foreground px-1">+{dayScholarships.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return cells;
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* WEEK VIEW */}
          {viewMode === "week" && (
            <div className="grid grid-cols-7 gap-2">
              {getWeekDates().map(date => {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                const dayScholarships = scholarshipsByDate[dateStr] || [];
                const isToday = new Date().toISOString().split("T")[0] === dateStr;

                return (
                  <Card key={dateStr} className={`shadow-card rounded-2xl min-h-[200px] ${isToday ? "border-primary/40 bg-primary/5" : ""}`}>
                    <CardContent className="p-2">
                      <div className="text-center mb-2">
                        <p className="text-[10px] text-muted-foreground">{DAY_NAMES[date.getDay()]}</p>
                        <p className={`text-sm font-bold ${isToday ? "text-primary" : "text-foreground"}`}>{date.getDate()}</p>
                      </div>
                      <div className="space-y-1">
                        {dayScholarships.map(m => {
                          const days = getDeadlineDays(m.scholarship.deadline);
                          const urgency = getUrgencyConfig(days);
                          return (
                            <button
                              key={m.scholarship.id}
                              onClick={() => setSelectedScholarshipId(m.scholarship.id)}
                              className={`w-full text-left text-[9px] font-medium px-1.5 py-1 rounded-lg ${urgency.bg} ${urgency.color} hover:opacity-80`}
                            >
                              {urgency.emoji} {m.scholarship.name.slice(0, 20)}…
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <div className="space-y-2">
              {listMatches.length === 0 ? (
                <Card className="shadow-card rounded-2xl">
                  <CardContent className="py-16 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-display font-semibold text-foreground">No upcoming deadlines</p>
                    <p className="text-sm text-muted-foreground mt-1">Adjust your filters to find more scholarships.</p>
                  </CardContent>
                </Card>
              ) : (
                listMatches.map((m, i) => {
                  const s = m.scholarship;
                  const days = getDeadlineDays(s.deadline);
                  const urgency = getUrgencyConfig(days);
                  const isSaved = savedScholarships.includes(s.id);
                  const hasReminder = reminders[s.id];

                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                      <Card className="shadow-card rounded-2xl hover-lift transition-all">
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className={`shrink-0 rounded-xl p-2.5 ${urgency.bg}`}>
                            <span className="text-lg">{urgency.emoji}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display font-semibold text-foreground text-sm truncate">{s.name}</h3>
                              {m.matchPercentage >= 70 && (
                                <Badge variant="secondary" className="text-[10px] rounded-full bg-primary/10 text-primary border-primary/15">
                                  <Sparkles className="mr-0.5 h-2.5 w-2.5" /> Recommended
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{s.provider}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-0.5 text-xs font-semibold text-foreground">
                                <IndianRupee className="h-3 w-3 text-primary" />₹{s.amount.toLocaleString()}
                              </span>
                              <span className={`text-xs font-medium ${urgency.color}`}>
                                <Clock className="inline h-3 w-3 mr-0.5" />{days}d left
                              </span>
                              <SuccessBadge probability={m.approvalProbability} showLabel={false} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => toggleReminder(s.id)} className={`p-2 rounded-xl transition-colors ${hasReminder ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} title={hasReminder ? "Remove reminder" : "Set reminder"}>
                              {hasReminder ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                            </button>
                            <button onClick={() => toggleSaved(s.id)} className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors">
                              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </button>
                            <Link to={`/dashboard/scholarship/${s.id}`}>
                              <Button size="sm" variant="outline" className="rounded-xl text-xs h-8">Details</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Scholarship Detail Sidebar */}
        <AnimatePresence>
          {selectedMatch && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-72 shrink-0 hidden lg:block"
            >
              <Card className="shadow-card rounded-2xl sticky top-6">
                <CardHeader className="pb-2">
                  <button onClick={() => setSelectedScholarshipId(null)} className="text-xs text-muted-foreground hover:text-foreground mb-1">✕ Close</button>
                  <CardTitle className="font-display text-sm leading-snug">{selectedMatch.scholarship.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{selectedMatch.scholarship.provider}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const days = getDeadlineDays(selectedMatch.scholarship.deadline);
                    const urgency = getUrgencyConfig(days);
                    return (
                      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${urgency.bg}`}>
                        <span className="text-lg">{urgency.emoji}</span>
                        <div>
                          <p className={`text-xs font-semibold ${urgency.color}`}>{urgency.label}</p>
                          <p className="text-[10px] text-muted-foreground">{days} days left to apply</p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span className="font-display font-bold text-foreground">₹{selectedMatch.scholarship.amount.toLocaleString()}</span>
                  </div>

                  <SuccessBadge probability={selectedMatch.approvalProbability} className="w-full justify-center" />

                  {/* Eligibility summary */}
                  <div className="space-y-1 text-xs">
                    {selectedMatch.scholarship.eligibility.minPercentage && (
                      <p className="text-muted-foreground">Min Marks: <span className="font-medium text-foreground">{selectedMatch.scholarship.eligibility.minPercentage}%</span></p>
                    )}
                    {selectedMatch.scholarship.eligibility.maxIncome && (
                      <p className="text-muted-foreground">Max Income: <span className="font-medium text-foreground">₹{(selectedMatch.scholarship.eligibility.maxIncome / 100000).toFixed(0)}L</span></p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <a href={selectedMatch.scholarship.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl text-xs">
                        <ExternalLink className="mr-1 h-3 w-3" /> Apply
                      </Button>
                    </a>
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => toggleSaved(selectedMatch.scholarship.id)}>
                      {savedScholarships.includes(selectedMatch.scholarship.id) ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => toggleReminder(selectedMatch.scholarship.id)}>
                      {reminders[selectedMatch.scholarship.id] ? <Bell className="h-3.5 w-3.5 text-primary" /> : <BellOff className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Urgency Legend */}
      <Card className="shadow-card rounded-2xl mt-6">
        <CardContent className="flex items-center gap-6 p-4 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Deadline Status:</span>
          {[
            { emoji: "🟢", label: "Open", desc: "22+ days" },
            { emoji: "🟡", label: "Closing Soon", desc: "8-21 days" },
            { emoji: "🔴", label: "Deadline This Week", desc: "≤7 days" },
          ].map(u => (
            <div key={u.label} className="flex items-center gap-1.5 text-xs">
              <span>{u.emoji}</span>
              <span className="font-medium text-foreground">{u.label}</span>
              <span className="text-muted-foreground">({u.desc})</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
