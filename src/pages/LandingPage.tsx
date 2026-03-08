import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { GraduationCap, Target, Brain, ArrowRight, Sparkles, TrendingUp, Users, Shield, Building2, Heart, Briefcase, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

function CountUp({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

const steps = [
  { icon: Users, title: "Build Your Profile", desc: "Tell us about your academics, family income, location, and career goals. Takes under 2 minutes." },
  { icon: Brain, title: "AI Analyzes & Matches", desc: "Our engine evaluates eligibility, predicts approval probability, and scores competition intensity." },
  { icon: Target, title: "Apply Strategically", desc: "Get prioritized recommendations with document checklists, essay drafts, and deadline tracking." },
];

const stats = [
  { value: 500, suffix: "+", prefix: "", label: "Active Scholarships" },
  { value: 95, suffix: "%", prefix: "", label: "Match Accuracy" },
  { value: 3, suffix: " Min", prefix: "<", label: "Profile Setup Time" },
];

const trustLogos = [
  { icon: Shield, label: "Government Schemes" },
  { icon: Heart, label: "NGOs & Trusts" },
  { icon: Briefcase, label: "CSR Foundations" },
  { icon: Building2, label: "Private Institutions" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground tracking-tight">EduGrant <span className="text-gradient">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-medium">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gradient-primary text-primary-foreground font-semibold shadow-glow rounded-xl px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — left-aligned, asymmetric */}
      <section className="relative pt-16">
        <div className="gradient-hero absolute inset-0" />
        {/* Subtle offset abstract shapes */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(250 55% 56%), transparent 70%)" }} />
        <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(224 65% 48%), transparent 70%)" }} />

        <div className="relative container mx-auto px-6 py-28 md:py-44">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Left content — takes 7 cols for asymmetry */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-7"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary-foreground/80 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" /> AI-Powered Scholarship Engine
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-foreground md:text-[3.5rem] lg:text-6xl leading-[1.08]">
                Find Scholarships<br />
                That <span className="text-gradient">Actually<br className="hidden lg:block" /> Approve You.</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/50 max-w-xl leading-relaxed">
                AI-powered matching with approval probability and funding gap analysis.
                Stop applying blindly — start applying strategically.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="gradient-primary text-primary-foreground font-bold shadow-glow text-base px-8 rounded-xl h-12">
                    Find My Scholarships <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-primary/50 bg-primary/10 text-primary font-semibold hover:bg-primary/20 rounded-xl h-12">
                    Explore Opportunities
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right — floating card visual */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-5 hidden md:block"
            >
              <div className="relative">
                {/* Main floating card */}
                <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] backdrop-blur-md p-6 shadow-float">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground">Top Match Found</p>
                      <p className="text-xs text-primary-foreground/40">National Merit Scholarship</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-primary-foreground/40">Match Score</span>
                      <span className="text-sm font-bold text-primary-foreground">94%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-primary-foreground/10 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} transition={{ duration: 1.2, delay: 0.8 }} className="h-full rounded-full gradient-primary" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-primary-foreground/40">Approval Probability</span>
                      <span className="text-sm font-bold text-success">High</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-medium bg-success/20 text-success px-2 py-0.5 rounded-full">🔥 High Approval</span>
                      <span className="text-[10px] font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">💰 ₹50,000</span>
                    </div>
                  </div>
                </div>
                {/* Small offset card behind */}
                <div className="absolute -bottom-4 -left-4 -z-10 rounded-2xl border border-primary-foreground/5 bg-primary-foreground/[0.02] backdrop-blur w-full h-full" />
              </div>
            </motion.div>
          </div>

          {/* Stats — left-aligned under content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 flex flex-wrap gap-6 md:gap-10"
          >
            {stats.map((s, i) => (
              <div key={s.label} className="min-w-[140px]">
                <div className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground tracking-tight">
                  <CountUp end={s.value} suffix={s.suffix} prefix={s.prefix} />
                </div>
                <div className="mt-1 text-sm text-primary-foreground/40">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works — connected steps with varied card sizes */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">Intelligent Discovery<br />in Three Steps</h2>
        </div>

        <div className="mt-16 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className={`group rounded-2xl border border-border bg-card p-7 shadow-card hover-lift ${i === 1 ? "md:-mt-4 md:scale-[1.03]" : ""}`}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="rounded-xl gradient-primary p-3 shadow-glow">
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-bold text-primary tracking-wider uppercase">Step {i + 1}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / trust */}
      <section className="border-y border-border/50 bg-muted/30 py-14">
        <div className="container mx-auto px-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-8 text-center">Scholarships sourced from trusted providers</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
            {trustLogos.map((t) => (
              <div key={t.label} className="flex items-center gap-2.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <t.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-5">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Why EduGrant AI</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">Not Just Another<br />Scholarship List</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We don't just show you scholarships — we predict which ones will actually approve you, analyze your funding gaps, and build a complete strategy.
            </p>
          </div>
          <div className="md:col-span-7 space-y-4">
            {[
              { title: "Approval Probability Score", desc: "Every scholarship comes with an AI-predicted approval likelihood based on your exact profile." },
              { title: "Funding Gap Analysis", desc: "See exactly how much your education costs vs. what scholarships can cover — no guesswork." },
              { title: "Smart Application Priority", desc: "Focus on high-match, low-competition scholarships first for maximum return on effort." },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card hover-lift"
              >
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-display text-sm font-semibold text-card-foreground">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <GraduationCap className="h-10 w-10 text-primary mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground leading-tight">Ready to Discover<br />Your Scholarships?</h2>
            <p className="mt-4 text-primary-foreground/45 max-w-lg leading-relaxed">Join thousands of students who found their perfect scholarships using AI-powered matching and strategic planning.</p>
            <Link to="/signup">
              <Button size="lg" className="mt-8 gradient-primary text-primary-foreground font-bold shadow-glow px-8 rounded-xl h-12">
                Create Free Account <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-display text-sm font-semibold text-foreground">EduGrant AI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>© 2026 EduGrant AI · SDG 4 – Quality Education · SDG 10 – Reduced Inequalities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
