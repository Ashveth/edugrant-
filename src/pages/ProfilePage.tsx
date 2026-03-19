import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Save, GraduationCap, IndianRupee, MapPin, Briefcase, Shield, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { indianStates, fieldsOfStudy } from "@/data/scholarships";
import { StudentProfile } from "@/types/scholarship";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import AvatarUpload from "@/components/AvatarUpload";

function ProfileStrengthBar({ profile }: { profile: StudentProfile }) {
  const fields = [
    { key: "fullName", label: "Name" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
    { key: "category", label: "Category" },
    { key: "annualFamilyIncome", label: "Income" },
    { key: "academicPercentage", label: "Marks" },
    { key: "educationLevel", label: "Education" },
    { key: "fieldOfStudy", label: "Field" },
    { key: "state", label: "State" },
    { key: "targetCourseCost", label: "Course Cost" },
  ];

  const filled = fields.filter(f => {
    const val = profile[f.key as keyof StudentProfile];
    return val !== undefined && val !== "" && val !== 0;
  });
  const strength = Math.round((filled.length / fields.length) * 100);

  return (
    <Card className="shadow-card rounded-2xl border-primary/10 overflow-hidden">
      <div className="h-1 gradient-primary" style={{ width: `${strength}%`, transition: "width 0.6s ease" }} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-semibold text-foreground">Profile Strength</span>
          </div>
          <Badge variant={strength >= 80 ? "default" : strength >= 50 ? "secondary" : "destructive"} className="rounded-lg text-[11px] font-bold">
            {strength}%
          </Badge>
        </div>
        <Progress value={strength} className="h-1.5 rounded-full mb-3" />
        <div className="flex flex-wrap gap-1.5">
          {fields.map(f => {
            const val = profile[f.key as keyof StudentProfile];
            const isFilled = val !== undefined && val !== "" && val !== 0;
            return (
              <span key={f.key} className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${isFilled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {isFilled ? <CheckCircle2 className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}
                {f.label}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function FormField({ label, icon, children, hint }: { label: string; icon?: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { profile, setProfile, userEmail, userId, avatarUrl, setAvatarUrl } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<StudentProfile>(
    profile || {
      fullName: "", age: 18, gender: "Male", category: "General",
      annualFamilyIncome: 300000, academicPercentage: 75,
      educationLevel: "Undergraduate", fieldOfStudy: "Engineering",
      state: "Maharashtra", targetCourseCost: 500000,
    }
  );

  const [saving, setSaving] = useState(false);
  const update = (key: keyof StudentProfile, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const hasChanges = useMemo(() => {
    if (!profile) return true;
    return JSON.stringify(profile) !== JSON.stringify(form);
  }, [profile, form]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    setSaving(true);
    await setProfile(form);
    setSaving(false);
    toast({ title: "Profile saved! Finding your scholarships..." });
    navigate("/dashboard/scholarships");
  };

  const inputClass = "mt-1.5 h-10 rounded-xl border-border/60 bg-card focus:border-primary/40 focus:shadow-search transition-all";

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header with avatar area */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <User className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
              {form.fullName || "Student Profile"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {userEmail && <span className="text-muted-foreground/70">{userEmail} · </span>}
              Fill in your details for AI-powered scholarship matches
            </p>
          </div>
          {hasChanges && (
            <Badge variant="secondary" className="rounded-lg text-[11px] shrink-0 self-start sm:self-center">
              Unsaved changes
            </Badge>
          )}
        </div>

        {/* Profile Strength */}
        <ProfileStrengthBar profile={form} />

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <Card className="shadow-card rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">Personal Information</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Basic details for scholarship eligibility</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField label="Full Name" icon={<User className="h-3 w-3" />}>
                    <Input className={inputClass} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Enter your full name" />
                  </FormField>
                </div>
                <FormField label="Age" hint="Between 14 and 35 years">
                  <Input className={inputClass} type="number" min={14} max={35} value={form.age} onChange={(e) => update("age", parseInt(e.target.value) || 18)} />
                </FormField>
                <FormField label="Gender">
                  <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{["Male","Female","Other"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Category" hint="Reservation category">
                  <Select value={form.category} onValueChange={(v) => update("category", v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{["General","OBC","SC","ST"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Annual Family Income" icon={<IndianRupee className="h-3 w-3" />} hint="Combined household income">
                  <Input className={inputClass} type="number" min={0} value={form.annualFamilyIncome} onChange={(e) => update("annualFamilyIncome", parseInt(e.target.value) || 0)} />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Academic Details */}
          <Card className="shadow-card rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">Academic Details</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Education background for matching accuracy</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Academic Percentage" icon={<GraduationCap className="h-3 w-3" />} hint="Latest exam percentage">
                  <Input className={inputClass} type="number" min={0} max={100} value={form.academicPercentage} onChange={(e) => update("academicPercentage", parseFloat(e.target.value) || 0)} />
                </FormField>
                <FormField label="Education Level" icon={<Briefcase className="h-3 w-3" />}>
                  <Select value={form.educationLevel} onValueChange={(v) => update("educationLevel", v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{["High School","Undergraduate","Postgraduate","Doctorate"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Field of Study">
                  <Select value={form.fieldOfStudy} onValueChange={(v) => update("fieldOfStudy", v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{fieldsOfStudy.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="State" icon={<MapPin className="h-3 w-3" />}>
                  <Select value={form.state} onValueChange={(v) => update("state", v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Target Course Cost" icon={<IndianRupee className="h-3 w-3" />} hint="Total cost of your target course/program">
                    <Input className={inputClass} type="number" min={0} value={form.targetCourseCost} onChange={(e) => update("targetCourseCost", parseInt(e.target.value) || 0)} />
                  </FormField>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save button — sticky on mobile */}
          <div className="sticky bottom-4 z-10">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/90 backdrop-blur-lg border border-border/60 shadow-float">
              <Button
                type="submit"
                disabled={saving || !hasChanges}
                className="flex-1 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl h-11 text-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Profile & Find Scholarships</>
                )}
              </Button>
              {!hasChanges && profile && (
                <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:block">✓ All saved</span>
              )}
            </div>
          </div>
        </form>

        {/* Security Section */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Security</h2>
          </div>
          <TwoFactorSetup />
        </div>
      </motion.div>
    </div>
  );
}
