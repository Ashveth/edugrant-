import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";

const toneOptions = ["Professional", "Heartfelt", "Confident", "Humble"];

function generateEssay(scholarshipName: string, name: string, field: string, income: number, percentage: number, tone: string): string {
  const incomeL = (income / 100000).toFixed(1);
  const toneIntro = tone === "Heartfelt"
    ? `Growing up in a family with an annual income of ₹${incomeL} lakhs, I learned early that education is the most powerful tool for transformation.`
    : tone === "Confident"
    ? `I am writing to express my strong candidacy for the ${scholarshipName}. With an academic record of ${percentage}% in ${field}, I am confident in my ability to make the most of this opportunity.`
    : tone === "Humble"
    ? `I humbly submit my application for the ${scholarshipName}, hoping that my dedication and circumstances will be considered worthy of this support.`
    : `I am honored to apply for the ${scholarshipName}. As a student of ${field} with ${percentage}% academic performance, I believe I am a strong candidate for this scholarship.`;

  return `Dear Scholarship Committee,\n\n${toneIntro}\n\nMy name is ${name}, and I am currently pursuing ${field}. Coming from a family with an annual income of ₹${incomeL} lakhs, this scholarship would significantly ease the financial burden on my family and allow me to focus entirely on my academic and career goals.\n\nThroughout my academic journey, I have maintained a consistent performance of ${percentage}%, which reflects my dedication to learning and personal growth. I believe that education is not just about grades — it's about developing the skills and perspective needed to contribute meaningfully to society.\n\nThe ${scholarshipName} aligns perfectly with my aspirations. With this support, I plan to deepen my knowledge in ${field}, engage in research, and eventually give back to my community through mentorship and innovation.\n\nI am committed to making the most of every opportunity that comes my way, and this scholarship would be a transformative stepping stone in my journey. I sincerely hope you will consider my application.\n\nThank you for your time and for investing in the future of students like me.\n\nSincerely,\n${name}`;
}

export default function EssayGeneratorPage() {
  const { profile } = useApp();
  const [selectedScholarship, setSelectedScholarship] = useState("");
  const [tone, setTone] = useState("Professional");
  const [essay, setEssay] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!profile) return;
    const s = scholarships.find((s) => s.id === selectedScholarship);
    const name = s?.name || "this scholarship";
    setEssay(generateEssay(name, profile.fullName, profile.fieldOfStudy, profile.annualFamilyIncome, profile.academicPercentage, tone));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(essay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> AI Essay Generator
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">Generate a personalized scholarship application essay</p>
      </div>

      {!profile ? (
        <Card className="border-primary/30 gradient-subtle shadow-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please complete your profile first to generate essays.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="font-display text-lg">Essay Settings</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Scholarship</Label>
                <Select value={selectedScholarship} onValueChange={setSelectedScholarship}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select scholarship" /></SelectTrigger>
                  <SelectContent>{scholarships.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{toneOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} disabled={!selectedScholarship} className="gradient-primary text-primary-foreground font-semibold shadow-glow">
            <Sparkles className="mr-2 h-4 w-4" /> Generate Essay
          </Button>

          {essay && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display text-lg">Generated Essay</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Textarea value={essay} onChange={(e) => setEssay(e.target.value)} rows={18} className="font-sans text-sm leading-relaxed" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
