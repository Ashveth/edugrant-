import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { fieldsOfStudy, indianStates } from "@/data/scholarships";
import { lovable } from "@/integrations/lovable/index";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [educationLevel, setEducationLevel] = useState("Undergraduate");
  const [fieldOfStudy, setFieldOfStudy] = useState("Engineering");
  const [percentage, setPercentage] = useState("75");
  const [income, setIncome] = useState("300000");
  const [category, setCategory] = useState("General");
  const [state, setState] = useState("Maharashtra");
  const [courseCost, setCourseCost] = useState("500000");
  const { signup, setProfile } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await signup(email, password, name);
    setLoading(false);
    if (result.error) {
      toast({ title: "Signup failed", description: result.error, variant: "destructive" });
      return;
    }
    setProfile({
      fullName: name,
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
    toast({ title: "Account created! Welcome to EduGrant AI." });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 gradient-hero lg:flex lg:items-center lg:justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, hsl(265 70% 58%) 0%, transparent 50%), radial-gradient(circle at 70% 60%, hsl(230 75% 55%) 0%, transparent 50%)" }} />
        <div className="relative text-center px-12">
          <GraduationCap className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-6 font-display text-3xl font-bold text-primary-foreground">Join EduGrant AI</h2>
          <p className="mt-4 text-primary-foreground/60 max-w-md mx-auto">Create your free account and discover scholarships that match your unique academic profile.</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 overflow-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold">EduGrant AI</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start your scholarship journey today</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder="Your full name" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@email.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password * (min 6)</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Education Level</Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["High School","Undergraduate","Postgraduate","Doctorate"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Field of Study</Label>
                <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{fieldsOfStudy.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marks %</Label>
                <Input className="mt-1" type="number" min={0} max={100} value={percentage} onChange={(e) => setPercentage(e.target.value)} />
              </div>
              <div>
                <Label>Annual Family Income (₹)</Label>
                <Input className="mt-1" type="number" min={0} value={income} onChange={(e) => setIncome(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["General","OBC","SC","ST"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Course Cost (₹)</Label>
                <Input className="mt-1" type="number" min={0} value={courseCost} onChange={(e) => setCourseCost(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
