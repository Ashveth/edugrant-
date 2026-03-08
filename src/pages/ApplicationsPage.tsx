import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Plus, ExternalLink, Clock, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useApp, Application } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color?: string }> = {
  draft: { label: "Draft", variant: "outline" },
  applied: { label: "Applied", variant: "default" },
  pending: { label: "Under Review", variant: "secondary" },
  shortlisted: { label: "Shortlisted", variant: "default", color: "bg-amber-500 text-white border-amber-500" },
  interview: { label: "Interview Stage", variant: "default", color: "bg-purple-500 text-white border-purple-500" },
  accepted: { label: "Accepted", variant: "default", color: "bg-emerald-500 text-white border-emerald-500" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function ApplicationsPage() {
  const { applications, updateApplication, deleteApplication, savedScholarships, addApplication } = useApp();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = filterStatus === "all" ? applications : applications.filter((a) => a.status === filterStatus);

  const handleStartTracking = async (scholarshipId: string) => {
    await addApplication(scholarshipId);
    toast({ title: "Application tracking started!" });
  };

  const handleStatusChange = async (app: Application, newStatus: string) => {
    await updateApplication(app.id, { status: newStatus as Application["status"] });
    toast({ title: `Status updated to ${statusConfig[newStatus]?.label}` });
  };

  const handleSaveNotes = async (id: string) => {
    await updateApplication(id, { notes: editNotes });
    setEditingId(null);
    toast({ title: "Notes saved!" });
  };

  // Scholarships that are saved but not yet tracked
  const untrackedSaved = savedScholarships.filter(
    (sid) => !applications.find((a) => a.scholarship_id === sid)
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Application Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="pending">Under Review</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick add from saved */}
      {untrackedSaved.length > 0 && (
        <Card className="mb-6 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-foreground mb-3">Start tracking saved scholarships:</p>
            <div className="flex flex-wrap gap-2">
              {untrackedSaved.slice(0, 5).map((sid) => {
                const s = scholarships.find((x) => x.id === sid);
                if (!s) return null;
                return (
                  <Button key={sid} size="sm" variant="outline" className="rounded-xl text-xs"
                    onClick={() => handleStartTracking(sid)}>
                    <Plus className="mr-1 h-3 w-3" /> {s.name.slice(0, 30)}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5">
            <ClipboardList className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="font-display font-semibold text-foreground text-lg mb-1">No applications yet</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Save scholarships first, then start tracking your applications here.
          </p>
          <Link to="/dashboard/scholarships">
            <Button className="mt-6 gradient-primary text-primary-foreground font-semibold rounded-xl">
              Browse Scholarships
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const s = scholarships.find((x) => x.id === app.scholarship_id);
            if (!s) return null;
            const cfg = statusConfig[app.status] || statusConfig.draft;

            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="shadow-card rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold text-foreground truncate">{s.name}</h3>
                          <Badge variant={cfg.variant} className={`rounded-lg shrink-0 ${cfg.color || ""}`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.provider} · ₹{s.amount.toLocaleString()}</p>

                        {app.applied_at && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Applied {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                        )}

                        {/* Notes */}
                        {editingId === app.id ? (
                          <div className="mt-3">
                            <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Add notes about this application..." className="text-sm" rows={2} />
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => handleSaveNotes(app.id)} className="rounded-lg">
                                <Check className="mr-1 h-3 w-3" /> Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="rounded-lg">
                                <X className="mr-1 h-3 w-3" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          app.notes && <p className="text-xs text-muted-foreground mt-2 italic">📝 {app.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Select value={app.status} onValueChange={(v) => handleStatusChange(app, v)}>
                          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="pending">In Review</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                            onClick={() => { setEditingId(app.id); setEditNotes(app.notes || ""); }}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => deleteApplication(app.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
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
