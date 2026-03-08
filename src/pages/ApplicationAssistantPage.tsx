import { useState } from "react";
import { motion } from "framer-motion";
import { FileEdit, Loader2, Sparkles, BookOpen, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type DocType = "sop" | "essay" | "recommendation";

const docTypeConfig: Record<DocType, { label: string; icon: typeof FileEdit; description: string }> = {
  sop: { label: "Statement of Purpose", icon: BookOpen, description: "Get a structured outline for your SOP with key themes and section guidance." },
  essay: { label: "Scholarship Essay", icon: FileText, description: "Receive strategic angles and structure suggestions for compelling essays." },
  recommendation: { label: "Recommendation Letter", icon: Users, description: "Get an outline framework to share with your recommender." },
};

export default function ApplicationAssistantPage() {
  const { profile } = useApp();
  const { toast } = useToast();
  const [docType, setDocType] = useState<DocType>("sop");
  const [scholarshipName, setScholarshipName] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.fieldOfStudy || "");
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || "");
  const [achievements, setAchievements] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!scholarshipName.trim()) {
      toast({ title: "Please enter the scholarship name", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/application-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type: docType,
            scholarshipName,
            fieldOfStudy,
            educationLevel,
            achievements,
            careerGoals,
            profile,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to generate");
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: e instanceof Error ? e.message : "Error generating outline", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const DocIcon = docTypeConfig[docType].icon;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileEdit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Application Assistant</h1>
            <p className="text-muted-foreground text-sm">Get structural outlines and strategic suggestions for your application documents.</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={docType} onValueChange={(v) => setDocType(v as DocType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sop" className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> SOP
          </TabsTrigger>
          <TabsTrigger value="essay" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Essay
          </TabsTrigger>
          <TabsTrigger value="recommendation" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Recommendation
          </TabsTrigger>
        </TabsList>

        {(["sop", "essay", "recommendation"] as DocType[]).map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {(() => { const Icon = docTypeConfig[type].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
                  {docTypeConfig[type].label} Outline
                </CardTitle>
                <CardDescription>{docTypeConfig[type].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Scholarship Name *</label>
                    <Input
                      placeholder="e.g., National Merit Scholarship"
                      value={scholarshipName}
                      onChange={(e) => setScholarshipName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Field of Study</label>
                    <Input
                      placeholder="e.g., Computer Science"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Education Level</label>
                    <Select value={educationLevel} onValueChange={setEducationLevel}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Key Achievements</label>
                  <Textarea
                    placeholder="List your notable achievements, awards, projects..."
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Career Goals</label>
                  <Textarea
                    placeholder="What are your short-term and long-term career goals?"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating outline...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate {docTypeConfig[type].label} Outline
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DocIcon className="h-5 w-5 text-primary" />
                {docTypeConfig[docType].label} — Outline & Strategy
              </CardTitle>
              <CardDescription>
                Use this framework to structure your own writing. This is a guide, not a final draft.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
