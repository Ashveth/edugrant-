import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2, CheckCircle2, FileText, User, GraduationCap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fieldsOfStudy } from "@/data/scholarships";

interface ScholarshipData {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string;
  required_documents: string[];
  accepts_direct_apply: boolean;
}

interface UserDoc {
  id: string;
  document_name: string;
  file_name: string;
  file_path: string;
}

export default function DirectApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, userId, userEmail } = useApp();
  const { toast } = useToast();

  const [scholarship, setScholarship] = useState<ScholarshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userDocs, setUserDocs] = useState<UserDoc[]>([]);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("India");
  const [educationLevel, setEducationLevel] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [gpa, setGpa] = useState("");
  const [institution, setInstitution] = useState("");
  const [sop, setSop] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<Record<string, string>>({});

  // Load scholarship from DB
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data } = await supabase
        .from("scholarships")
        .select("id, name, provider, amount, deadline, required_documents, accepts_direct_apply")
        .eq("id", id)
        .single();
      if (data) setScholarship(data as ScholarshipData);
      setLoading(false);
    };
    load();
  }, [id]);

  // Load user documents
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await supabase
        .from("user_documents")
        .select("id, document_name, file_name, file_path")
        .eq("user_id", userId);
      if (data) setUserDocs(data);
    };
    load();
  }, [userId]);

  // Auto-fill from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setEducationLevel(profile.educationLevel || "");
      setFieldOfStudy(profile.fieldOfStudy || "");
      setGpa(String(profile.academicPercentage || ""));
    }
    if (userEmail) setEmail(userEmail);
  }, [profile, userEmail]);

  const toggleDoc = (docType: string, docId: string) => {
    setSelectedDocs((prev) => {
      const next = { ...prev };
      if (next[docType] === docId) {
        delete next[docType];
      } else {
        next[docType] = docId;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !scholarship) return;

    if (!fullName || !email || !educationLevel) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Create application
      const { data: app, error: appError } = await supabase
        .from("applications")
        .insert({
          user_id: userId,
          scholarship_id: scholarship.id,
          status: "applied",
          is_direct_apply: true,
          full_name: fullName,
          email,
          phone,
          date_of_birth: dob || null,
          country,
          education_level: educationLevel,
          field_of_study: fieldOfStudy,
          gpa_percentage: gpa ? parseFloat(gpa) : null,
          institution_name: institution,
          statement_of_purpose: sop,
          applied_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (appError) throw appError;

      // Link selected documents
      if (app) {
        const docInserts = Object.entries(selectedDocs).map(([docType, docId]) => ({
          application_id: app.id,
          document_id: docId,
          document_type: docType,
        }));
        if (docInserts.length > 0) {
          await supabase.from("application_documents").insert(docInserts);
        }
      }

      setSubmitted(true);
      toast({ title: "Application submitted successfully!" });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!scholarship) {
    return <div className="text-center py-20 text-muted-foreground">Scholarship not found.</div>;
  }

  if (!scholarship.accepts_direct_apply) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-muted-foreground mb-4">This scholarship does not accept direct applications through EduGrant AI.</p>
        <Link to={`/dashboard/scholarship/${id}`}>
          <Button variant="outline">View Scholarship Details</Button>
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-20">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
        <p className="text-muted-foreground mb-2">Your application for <strong>{scholarship.name}</strong> has been submitted successfully.</p>
        <p className="text-sm text-muted-foreground mb-6">You can track its status in your Application Tracker.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard/applications"><Button>View Applications</Button></Link>
          <Link to="/dashboard/scholarships"><Button variant="outline">Browse More</Button></Link>
        </div>
      </motion.div>
    );
  }

  const days = Math.max(0, Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / 86400000));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <Link to={`/dashboard/scholarship/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Scholarship
      </Link>

      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="bg-emerald-500 text-white border-emerald-500">Direct Apply</Badge>
            <Badge variant={days <= 14 ? "destructive" : "secondary"}>{days}d left</Badge>
          </div>
          <CardTitle className="font-display text-xl">{scholarship.name}</CardTitle>
          <CardDescription>{scholarship.provider} · ₹{scholarship.amount.toLocaleString()}</CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Degree Level *</Label>
              <Select value={educationLevel} onValueChange={setEducationLevel}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["High School", "Undergraduate", "Postgraduate", "Doctorate"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Field of Study</Label>
              <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {fieldsOfStudy.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gpa">GPA / Percentage</Label>
              <Input id="gpa" type="number" step="0.01" min="0" max="100" value={gpa} onChange={(e) => setGpa(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="institution">Institution Name</Label>
              <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} className="mt-1" placeholder="Your college/university" />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Required Documents</CardTitle>
            <CardDescription>Select from your uploaded documents or <Link to="/dashboard/documents" className="text-primary hover:underline">upload new ones</Link>.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scholarship.required_documents?.map((docType) => {
              const matching = userDocs.filter((d) =>
                d.document_name.toLowerCase().includes(docType.toLowerCase().split(" ")[0]) ||
                docType.toLowerCase().includes(d.document_name.toLowerCase().split(" ")[0])
              );
              return (
                <div key={docType} className="border border-border/60 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground mb-2">{docType}</p>
                  {userDocs.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No documents uploaded yet. <Link to="/dashboard/documents" className="text-primary hover:underline">Upload documents</Link></p>
                  ) : (
                    <div className="space-y-1.5">
                      {userDocs.map((doc) => (
                        <label key={doc.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded-md p-1.5 transition-colors">
                          <Checkbox
                            checked={selectedDocs[docType] === doc.id}
                            onCheckedChange={() => toggleDoc(docType, doc.id)}
                          />
                          <span className="text-foreground">{doc.document_name}</span>
                          <span className="text-xs text-muted-foreground">({doc.file_name})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Statement of Purpose */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> Statement of Purpose</CardTitle>
            <CardDescription>Write a brief statement about why you deserve this scholarship.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sop}
              onChange={(e) => setSop(e.target.value)}
              placeholder="Explain your academic goals, financial need, and why this scholarship aligns with your aspirations..."
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} className="flex-1 h-12 gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl">
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting your application…</>
            ) : (
              <><Send className="h-4 w-4" /> Submit Application</>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="rounded-xl">Cancel</Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Submit your scholarship application directly through EduGrant AI. Your data is encrypted and secure.
        </p>
      </form>
    </motion.div>
  );
}
