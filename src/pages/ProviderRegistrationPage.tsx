import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Globe, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ProviderRegistrationPage() {
  const { userId, userEmail } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orgName, setOrgName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState(userEmail || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast({ title: "Organization name is required", variant: "destructive" });
      return;
    }
    if (!userId) {
      toast({ title: "You must be logged in", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.rpc("register_as_provider", {
      _organization_name: orgName.trim(),
      _description: description.trim(),
      _website: website.trim(),
      _contact_email: contactEmail.trim(),
    });
    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "You're now a scholarship provider!", description: "You can create scholarships and review applications." });
    navigate("/dashboard/provider");
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-xl">Register as Scholarship Provider</CardTitle>
            <CardDescription>Set up your organization to create scholarships and review applications directly on EduGrant AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name *</Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="orgName" placeholder="e.g. National Education Trust" className="pl-10" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                </div>
              </div>

              <div>
                <Label htmlFor="desc">Organization Description</Label>
                <Textarea id="desc" placeholder="Brief description of your organization and the scholarships you offer..." className="mt-1" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative mt-1">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="website" placeholder="https://your-organization.com" className="pl-10" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="contactEmail" type="email" placeholder="contact@organization.com" className="pl-10" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                <FileText className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                As a provider you'll be able to create scholarships, receive applications, review candidates, and manage the entire selection process.
              </div>

              <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow">
                {loading ? "Registering..." : "Register as Provider"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
