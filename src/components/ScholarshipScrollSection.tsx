import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Clock, Bookmark, BookmarkCheck, ExternalLink, IndianRupee, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SuccessBadge } from "@/components/SuccessBadge";
import { MatchResult } from "@/types/scholarship";

interface ScholarshipScrollSectionProps {
  title: string;
  icon?: React.ReactNode;
  matches: MatchResult[];
  savedScholarships: string[];
  onToggleSave: (id: string) => void;
  viewAllLink?: string;
}

function getDeadlineDays(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

export function ScholarshipScrollSection({ title, icon, matches, savedScholarships, onToggleSave, viewAllLink }: ScholarshipScrollSectionProps) {
  if (matches.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          {icon} {title}
        </h2>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <Button variant="ghost" size="sm" className="text-primary font-medium gap-1 rounded-xl">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
        {matches.map((m, i) => {
          const s = m.scholarship;
          const days = getDeadlineDays(s.deadline);
          const isSaved = savedScholarships.includes(s.id);

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="snap-start shrink-0 w-[280px]"
            >
              <Card className="shadow-card hover-lift rounded-2xl h-full border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      <Sparkles className="h-2.5 w-2.5" /> {m.matchPercentage}%
                    </span>
                    <button onClick={() => onToggleSave(s.id)} className="text-primary hover:scale-110 transition-transform">
                      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>

                  <div>
                    <p className="font-display text-sm font-semibold text-card-foreground leading-snug line-clamp-2">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.provider}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <IndianRupee className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-foreground">₹{(s.amount / 1000).toFixed(0)}K</span>
                    </div>
                    <Badge variant={days <= 14 ? "destructive" : "secondary"} className="text-[10px] rounded-lg">
                      <Clock className="mr-0.5 h-2.5 w-2.5" /> {days}d
                    </Badge>
                  </div>

                  <SuccessBadge probability={m.approvalProbability} className="w-full justify-center" />

                  <div className="flex gap-2">
                    <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" className="w-full gradient-primary text-primary-foreground font-semibold text-xs rounded-xl shadow-glow h-8">
                        <ExternalLink className="mr-1 h-3 w-3" /> Apply
                      </Button>
                    </a>
                    <Link to={`/dashboard/scholarship/${s.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl text-xs h-8">Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
