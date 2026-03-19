import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Save } from "lucide-react";
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
      <div className="mb-8">
        <h1 className="page-title">
          <User className="h-6 w-6 text-primary" /> Student Profile
        </h1>
        <p className="page-subtitle">Fill in your details to get AI-powered scholarship matches</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="shadow-card rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
              <Input className="mt-1.5 h-10 rounded-xl" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Enter your full name" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Age</Label>
              <Input className="mt-1.5 h-10 rounded-xl" type="number" min={14} max={35} value={form.age} onChange={(e) => update("age", parseInt(e.target.value) || 18)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger className="mt-1.5 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{["Male","Female","Other"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Category</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="mt-1.5 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{["General","OBC","SC","ST"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Annual Family Income (₹)</Label>
              <Input className="mt-1.5 h-10 rounded-xl" type="number" min={0} value={form.annualFamilyIncome} onChange={(e) => update("annualFamilyIncome", parseInt(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">Academic Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Academic Percentage (%)</Label>
              <Input className="mt-1.5 h-10 rounded-xl" type="number" min={0} max={100} value={form.academicPercentage} onChange={(e) => update("academicPercentage", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Education Level</Label>
              <Select value={form.educationLevel} onValueChange={(v) => update("educationLevel", v)}>
                <SelectTrigger className="mt-1.5 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{["High School","Undergraduate","Postgraduate","Doctorate"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Field of Study</Label>
              <Select value={form.fieldOfStudy} onValueChange={(v) => update("fieldOfStudy", v)}>
                <SelectTrigger className="mt-1.5 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{fieldsOfStudy.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">State</Label>
              <Select value={form.state} onValueChange={(v) => update("state", v)}>
                <SelectTrigger className="mt-1.5 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">Target Course Cost (₹)</Label>
              <Input className="mt-1.5 h-10 rounded-xl" type="number" min={0} value={form.targetCourseCost} onChange={(e) => update("targetCourseCost", parseInt(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl h-11 px-6">
          <Save className="mr-2 h-4 w-4" /> Save Profile & Find Scholarships
        </Button>
      </form>

      <TwoFactorSetup />
    </motion.div>
  );
}
