import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Save, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { indianStates, fieldsOfStudy } from "@/data/scholarships";
import { StudentProfile } from "@/types/scholarship";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export default function ProfilePage() {
  const { profile, setProfile } = useApp();
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

  const update = (key: keyof StudentProfile, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    await setProfile(form);
    toast({ title: "Profile saved! Finding your scholarships..." });
    navigate("/dashboard/scholarships");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Student Profile
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">Fill in your details to get AI-powered scholarship matches</p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Personal Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Full Name</Label>
              <Input className="mt-1.5" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Enter your full name" />
            </div>
            <div>
              <Label>Age</Label>
              <Input className="mt-1.5" type="number" min={14} max={35} value={form.age} onChange={(e) => update("age", parseInt(e.target.value) || 18)} />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{["Male","Female","Other"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{["General","OBC","SC","ST"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Annual Family Income (₹)</Label>
              <Input className="mt-1.5" type="number" min={0} value={form.annualFamilyIncome} onChange={(e) => update("annualFamilyIncome", parseInt(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Academic Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Academic Percentage (%)</Label>
              <Input className="mt-1.5" type="number" min={0} max={100} value={form.academicPercentage} onChange={(e) => update("academicPercentage", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Education Level</Label>
              <Select value={form.educationLevel} onValueChange={(v) => update("educationLevel", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{["High School","Undergraduate","Postgraduate","Doctorate"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Field of Study</Label>
              <Select value={form.fieldOfStudy} onValueChange={(v) => update("fieldOfStudy", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{fieldsOfStudy.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>State</Label>
              <Select value={form.state} onValueChange={(v) => update("state", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Target Course Cost (₹)</Label>
              <Input className="mt-1.5" type="number" min={0} value={form.targetCourseCost} onChange={(e) => update("targetCourseCost", parseInt(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="mt-6 gradient-primary text-primary-foreground font-semibold shadow-glow">
          <Save className="mr-2 h-4 w-4" /> Save Profile & Find Scholarships
        </Button>
      </form>

      <TwoFactorSetup />

      <DownloadAppCard />
    </motion.div>
  );
}

function DownloadAppCard() {
  const { canInstall, isInstalled, install } = usePwaInstall();

  return (
    <Card className="mt-4 shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" /> Download App
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Install EduGrant AI on your desktop for quick access, offline support, and a native app experience.
        </p>
        {isInstalled ? (
          <div className="flex items-center gap-2 text-sm font-medium text-accent">
            <Check className="h-4 w-4" />
            App is installed on your device
          </div>
        ) : canInstall ? (
          <Button onClick={install} className="gradient-primary text-primary-foreground font-semibold shadow-glow">
            <Download className="mr-2 h-4 w-4" /> Install EduGrant AI
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Open this app in Chrome or Edge and visit the published URL to enable installation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
