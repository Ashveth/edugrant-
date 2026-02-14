import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Target, Brain, Clock, ArrowRight, Sparkles, TrendingUp, Users, Shield, Building2, Heart, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Users, title: "Create Profile", desc: "Tell us about your academics, income, location and goals" },
  { icon: Brain, title: "AI Matches & Predicts", desc: "Our engine analyzes eligibility, approval probability & competition" },
  { icon: Target, title: "Apply Smartly", desc: "Strategic recommendations with document checklists and essay drafts" },
];

const stats = [
  { value: "₹12Cr+", label: "Potential Aid Matched" },
  { value: "10,000+", label: "Scholarships Indexed" },
  { value: "+28%", label: "Avg Approval Boost" },
];

const trustLogos = [
  { icon: Shield, label: "Government Schemes" },
  { icon: Heart, label: "NGOs" },
  { icon: Briefcase, label: "CSR Foundations" },
  { icon: Building2, label: "Private Trusts" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">EduGrant <span className="text-gradient">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gradient-primary text-primary-foreground font-semibold shadow-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="gradient-hero absolute inset-0" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, hsl(265 70% 58%) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(230 75% 55%) 0%, transparent 50%)" }} />
        <div className="relative container mx-auto px-4 py-24 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary-foreground/90">
              <Sparkles className="h-4 w-4" /> AI-Powered Scholarship Engine
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-foreground md:text-6xl leading-[1.1]">
              Find Scholarships That{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Actually Approve You.</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/60 md:text-xl max-w-2xl mx-auto">
              AI-powered matching with approval probability and funding gap analysis.
              Stop applying blindly. Start applying strategically.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary text-primary-foreground font-bold shadow-glow text-base px-8">
                  Find My Scholarships <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Explore Opportunities
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 text-center backdrop-blur">
                <div className="font-display text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{s.value}</div>
                <div className="mt-1 text-sm text-primary-foreground/50">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">How EduGrant AI Works</h2>
          <p className="mt-3 text-muted-foreground">Intelligent scholarship discovery in three powerful steps</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover text-center"
            >
              <div className="mb-4 mx-auto inline-flex rounded-xl gradient-primary p-3">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-xs font-bold text-primary mb-2">Step {i + 1}</div>
              <h3 className="font-display text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wider">Trusted by scholarship providers</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustLogos.map((t) => (
              <div key={t.label} className="flex items-center gap-2 text-muted-foreground/60">
                <t.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-bold text-primary-foreground">Ready to Discover Your Scholarships?</h2>
          <p className="mt-3 text-primary-foreground/60 max-w-lg mx-auto">Join thousands of students who found their perfect scholarships using AI-powered matching.</p>
          <Link to="/signup">
            <Button size="lg" className="mt-8 gradient-primary text-primary-foreground font-bold shadow-glow px-8">
              Create Free Account <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 EduGrant AI. Empowering education through intelligent scholarship matching.</p>
          <p className="mt-1">SDG 4 – Quality Education · SDG 10 – Reduced Inequalities</p>
        </div>
      </footer>
    </div>
  );
}
