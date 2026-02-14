import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Target, ExternalLink, Clock, Sparkles, IndianRupee, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";

export default function SavedScholarshipsPage() {
  const { savedScholarships, toggleSaved } = useApp();
  const saved = scholarships.filter((s) => savedScholarships.includes(s.id));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" /> Saved Scholarships
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{saved.length} scholarship{saved.length !== 1 ? "s" : ""} saved</p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-24">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5">
            <Bookmark className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="font-display font-semibold text-foreground text-lg mb-1">No saved scholarships yet</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Start bookmarking scholarships you're interested in — they'll appear here for quick access.</p>
          <Link to="/dashboard/scholarships">
            <Button className="mt-6 gradient-primary text-primary-foreground font-semibold rounded-xl">
              <Target className="mr-2 h-4 w-4" /> Browse Scholarships
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map((s, i) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(s.deadline).getTime() - Date.now()) / 86400000));
            return (
              <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-card hover-lift rounded-2xl transition-all">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="hidden sm:flex shrink-0 rounded-xl gradient-primary p-3">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground truncate">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{s.provider}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-sm font-semibold text-foreground"><IndianRupee className="h-3.5 w-3.5 text-primary" />₹{s.amount.toLocaleString()}</span>
                        <Badge variant={daysLeft <= 14 ? "destructive" : "secondary"} className="rounded-lg">
                          <Clock className="mr-1 h-3 w-3" /> {daysLeft}d left
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/dashboard/scholarship/${s.id}`}>
                        <Button size="sm" variant="outline" className="rounded-xl">View</Button>
                      </Link>
                      <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl">
                          <ExternalLink className="mr-1 h-3 w-3" /> Apply
                        </Button>
                      </a>
                      <Button size="sm" variant="ghost" onClick={() => toggleSaved(s.id)} className="text-destructive hover:text-destructive rounded-xl">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
