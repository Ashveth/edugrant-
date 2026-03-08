import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Users, FileText, Download, CheckCircle2, XCircle, Clock, Eye, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProviderApplication {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  education_level: string | null;
  field_of_study: string | null;
  gpa_percentage: number | null;
  institution_name: string | null;
  statement_of_purpose: string | null;
  country: string | null;
  date_of_birth: string | null;
  applied_at: string | null;
  scholarship_id: string;
}

interface ProviderScholarship {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  is_active: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  pending: { label: "Under Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  shortlisted: { label: "Shortlisted", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  interview: { label: "Interview Stage", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  accepted: { label: "Accepted", color: "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

export default function ProviderDashboardPage() {
  const { userId } = useApp();
  const { toast } = useToast();

  const [isProvider, setIsProvider] = useState<boolean | null>(null);
  const [scholarships, setScholarships] = useState<ProviderScholarship[]>([]);
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is a provider
  useEffect(() => {
    if (!userId) return;
    const check = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "provider")
        .maybeSingle();
      setIsProvider(!!data);
      if (data) await loadProviderData();
      setLoading(false);
    };
    check();
  }, [userId]);

  const loadProviderData = async () => {
    if (!userId) return;
    // Load provider's scholarships
    const { data: schData } = await supabase
      .from("scholarships")
      .select("id, name, amount, deadline, is_active")
      .eq("provider_user_id", userId);

    if (schData) setScholarships(schData);

    // Load applications for provider's scholarships
    const { data: appData } = await supabase
      .from("applications")
      .select("*")
      .eq("is_direct_apply", true)
      .order("applied_at", { ascending: false });

    if (appData) setApplications(appData as ProviderApplication[]);
  };

  const updateAppStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", appId);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }

    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
    toast({ title: `Status updated to ${statusConfig[newStatus]?.label || newStatus}` });
  };

  const filtered = applications.filter((a) => {
    if (selectedScholarship !== "all" && a.scholarship_id !== selectedScholarship) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isProvider) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Provider Dashboard</h2>
        <p className="text-muted-foreground mb-4">
          Register as a scholarship provider to create scholarships, receive applications, and manage candidates — all from EduGrant AI.
        </p>
        <Button onClick={() => navigate("/dashboard/provider/register")} className="gradient-primary text-primary-foreground font-semibold shadow-glow">
          Register as Provider
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" /> Provider Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage scholarship applications and candidates.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Applications", value: stats.total, icon: FileText, color: "text-primary" },
          { label: "New Applications", value: stats.applied, icon: Clock, color: "text-blue-500" },
          { label: "Shortlisted", value: stats.shortlisted, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Accepted", value: stats.accepted, icon: Users, color: "text-purple-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 pt-5 pb-4">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={selectedScholarship} onValueChange={setSelectedScholarship}>
          <SelectTrigger className="w-60"><SelectValue placeholder="All Scholarships" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scholarships</SelectItem>
            {scholarships.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No applications found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const sch = scholarships.find((s) => s.id === app.scholarship_id);
            const isExpanded = expandedApp === app.id;
            const cfg = statusConfig[app.status] || statusConfig.applied;

            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-display font-semibold text-foreground">{app.full_name || "—"}</h3>
                          <Badge className={`rounded-lg text-[11px] ${cfg.color} border-0`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{app.email} {app.phone && `· ${app.phone}`}</p>
                        {sch && <p className="text-xs text-muted-foreground mt-0.5">Applied for: {sch.name}</p>}
                        {app.applied_at && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Select value={app.status} onValueChange={(v) => updateAppStatus(app.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t border-border/60">
                        <div className="grid gap-3 sm:grid-cols-2 text-sm">
                          <div><span className="text-muted-foreground">Education:</span> <span className="font-medium text-foreground">{app.education_level || "—"}</span></div>
                          <div><span className="text-muted-foreground">Field:</span> <span className="font-medium text-foreground">{app.field_of_study || "—"}</span></div>
                          <div><span className="text-muted-foreground">GPA/Marks:</span> <span className="font-medium text-foreground">{app.gpa_percentage ? `${app.gpa_percentage}%` : "—"}</span></div>
                          <div><span className="text-muted-foreground">Institution:</span> <span className="font-medium text-foreground">{app.institution_name || "—"}</span></div>
                          <div><span className="text-muted-foreground">Country:</span> <span className="font-medium text-foreground">{app.country || "—"}</span></div>
                          <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium text-foreground">{app.date_of_birth || "—"}</span></div>
                        </div>
                        {app.statement_of_purpose && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1">Statement of Purpose:</p>
                            <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{app.statement_of_purpose}</p>
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => updateAppStatus(app.id, "shortlisted")} className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Shortlist
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateAppStatus(app.id, "rejected")} className="text-xs text-destructive hover:text-destructive">
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      </motion.div>
                    )}
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
