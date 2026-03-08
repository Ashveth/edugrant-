import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { fieldsOfStudy, indianStates } from "@/data/scholarships";
import { useToast } from "@/hooks/use-toast";

export default function ProfileCompletionPrompt() {
  const { profile, setProfile, userEmail, isLoggedIn } = useApp();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);

  const [fullName, setFullName] = useState("");
  const [educationLevel, setEducationLevel] = useState("Undergraduate");
  const [fieldOfStudy, setFieldOfStudy] = useState("Engineering");
  const [percentage, setPercentage] = useState("75");
  const [income, setIncome] = useState("300000");
  const [category, setCategory] = useState("General");
  const [state, setState] = useState("Maharashtra");
  const [courseCost, setCourseCost] = useState("500000");
  const [saving, setSaving] = useState(false);

  // Show only if logged in, no profile exists, and not dismissed
  const needsCompletion = isLoggedIn && !profile && !dismissed;

  if (!needsCompletion) return null;

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    setSaving(true);
    await setProfile({
      fullName,
      age: 18,
      gender: "Male",
      category: category as any,
      annualFamilyIncome: parseInt(income) || 300000,
      academicPercentage: parseFloat(percentage) || 75,
      educationLevel: educationLevel as any,
      fieldOfStudy,
      state,
      targetCourseCost: parseInt(courseCost) || 500000,
    });
    setSaving(false);
    toast({ title: "Profile saved! Let's find your scholarships." });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-6"
      >
        <Card className="border-primary/30 shadow-glow overflow-hidden">
          <div className="gradient-primary p-4">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Sparkles className="h-5 w-5" />
              <h2 className="font-display text-lg font-bold">Complete Your Profile</h2>
            </div>
            <p className="text-primary-foreground/70 text-sm mt-1">
              Fill in your academic details so we can match you with the best scholarships.
            </p>
          </div>
          <CardContent className="pt-5 pb-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Full Name *</Label>
                <Input className="mt-1" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label>Education Level</Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["High School", "Undergraduate", "Postgraduate", "Doctorate"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Field of Study</Label>
                <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{fieldsOfStudy.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marks / Percentage</Label>
                <Input className="mt-1" type="number" min={0} max={100} value={percentage} onChange={(e) => setPercentage(e.target.value)} />
              </div>
              <div>
                <Label>Annual Family Income (₹)</Label>
                <Input className="mt-1" type="number" min={0} value={income} onChange={(e) => setIncome(e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["General", "OBC", "SC", "ST"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Course Cost (₹)</Label>
                <Input className="mt-1" type="number" min={0} value={courseCost} onChange={(e) => setCourseCost(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={saving} className="flex-1 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl">
                {saving ? "Saving..." : <><GraduationCap className="h-4 w-4 mr-2" /> Save & Find Scholarships <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
              <Button variant="ghost" onClick={() => setDismissed(true)} className="text-muted-foreground text-sm">
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
