import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Target, Brain, Clock, ArrowRight, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Target, title: "Smart Matching", desc: "AI matches your profile against hundreds of scholarships instantly" },
  { icon: Brain, title: "Explainable AI", desc: "Understand exactly why each scholarship is recommended for you" },
  { icon: Clock, title: "Deadline Alerts", desc: "Never miss a deadline with countdown timers on every scholarship" },
  { icon: Sparkles, title: "Essay Generator", desc: "AI-powered essay drafts tailored to each scholarship application" },
];

const stats = [
  { value: "500+", label: "Scholarships" },
  { value: "₹50Cr+", label: "Total Funding" },
  { value: "95%", label: "Match Accuracy" },
  { value: "10K+", label: "Students Helped" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-accent" />
            <span className="font-display text-xl font-bold text-foreground">EduGrant <span className="text-gradient-gold">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gradient-gold text-accent-foreground font-semibold shadow-gold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="gradient-hero absolute inset-0 opacity-95" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <Sparkles className="h-4 w-4" /> AI-Powered Scholarship Discovery
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-foreground md:text-6xl">
              Find Your Perfect{" "}
              <span className="text-gradient-gold">Scholarship</span>
              {" "}Match
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/70 md:text-xl">
              EduGrant AI analyzes your profile and matches you with the best scholarships — 
              with explainable reasoning, financial need scores, and application essay generation.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button size="lg" className="gradient-gold text-accent-foreground font-bold shadow-gold text-base px-8">
                  Start Matching <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  I Have an Account
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 text-center backdrop-blur">
                <div className="font-display text-2xl font-bold text-accent">{s.value}</div>
                <div className="mt-1 text-sm text-primary-foreground/60">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">How EduGrant AI Works</h2>
          <p className="mt-3 text-muted-foreground">Intelligent scholarship discovery in four powerful steps</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="mb-4 inline-flex rounded-xl gradient-gold p-3">
                <f.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-accent" />
          <h2 className="mt-4 font-display text-3xl font-bold text-primary-foreground">Ready to Discover Your Scholarships?</h2>
          <p className="mt-3 text-primary-foreground/70 max-w-lg mx-auto">Join thousands of students who found their perfect scholarships using AI-powered matching.</p>
          <Link to="/signup">
            <Button size="lg" className="mt-8 gradient-gold text-accent-foreground font-bold shadow-gold px-8">
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
