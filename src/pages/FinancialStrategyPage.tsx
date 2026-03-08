import { motion } from "framer-motion";
import { PieChart, IndianRupee, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { useScholarshipsFromDB } from "@/hooks/useScholarshipsFromDB";
import { matchScholarships } from "@/lib/matchingEngine";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["hsl(230, 75%, 55%)", "hsl(265, 70%, 58%)", "hsl(152, 60%, 42%)", "hsl(35, 92%, 50%)"];

export default function FinancialStrategyPage() {
  const { profile } = useApp();
  const matches = profile ? matchScholarships(profile, scholarships) : [];

  const totalCost = profile?.targetCourseCost || 500000;
  const scholarshipPotential = matches.filter(m => m.matchPercentage > 50).reduce((s, m) => s + m.scholarship.amount, 0);
  const grantPotential = Math.round(scholarshipPotential * 0.15);
  const remaining = Math.max(0, totalCost - scholarshipPotential - grantPotential);
  const loanSuggestion = remaining;

  const scholarshipPct = Math.round((scholarshipPotential / totalCost) * 100);
  const grantPct = Math.round((grantPotential / totalCost) * 100);
  const loanPct = Math.max(0, 100 - scholarshipPct - grantPct);

  const data = [
    { name: "Scholarships", value: Math.min(scholarshipPct, 100), amount: scholarshipPotential },
    { name: "Grants", value: Math.min(grantPct, 100 - Math.min(scholarshipPct, 100)), amount: grantPotential },
    { name: "Education Loan", value: Math.max(loanPct, 0), amount: loanSuggestion },
  ].filter(d => d.value > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <PieChart className="h-6 w-6 text-primary" /> Financial Strategy
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">Your personalized funding strategy based on AI matching</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Donut Chart */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Funding Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Details */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" /> Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground">Total Course Cost</p>
              <p className="font-display text-2xl font-bold text-foreground">₹{totalCost.toLocaleString()}</p>
            </div>
            {[
              { label: "Scholarship Potential", amount: scholarshipPotential, pct: scholarshipPct, color: "text-primary" },
              { label: "Grant Potential", amount: grantPotential, pct: grantPct, color: "text-accent" },
              { label: "Loan Suggestion", amount: loanSuggestion, pct: loanPct, color: "text-warning" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className={`text-xs ${item.color}`}>{item.pct}% of total</p>
                </div>
                <p className="font-display font-bold text-foreground">₹{item.amount.toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="shadow-card mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Strategy Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            scholarshipPct >= 70 ? "🎉 Great news! Scholarships can cover most of your education costs." : "📊 Apply to more scholarships to increase your coverage.",
            matches.length > 5 ? `🎯 You match ${matches.length} scholarships — focus on the top matches with highest approval probability.` : "📝 Complete your profile to unlock more scholarship matches.",
            loanPct > 40 ? "💡 Consider education loans with low interest rates for the remaining gap. Look into government subsidized loan schemes." : "✅ Your funding gap is manageable with available scholarships and grants.",
          ].map((tip, i) => (
            <p key={i} className="text-sm text-muted-foreground">{tip}</p>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
