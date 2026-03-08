import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Plus, X, ExternalLink, Bookmark, BookmarkCheck, IndianRupee, Calendar, Award, FileText, Shield, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScholarshipsFromDB } from "@/hooks/useScholarshipsFromDB";
import { Scholarship } from "@/types/scholarship";
import { useApp } from "@/context/AppContext";

const competitionColor: Record<string, string> = {
  Low: "bg-green-500/10 text-green-700 dark:text-green-400",
  Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  High: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const providerColor: Record<string, string> = {
  Government: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  NGO: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  CSR: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  Private: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

function getDaysLeft(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  return diff;
}

function SlotCard({ scholarship, onRemove, index }: { scholarship: Scholarship | null; onRemove: () => void; index: number }) {
  if (!scholarship) return null;

  const daysLeft = getDaysLeft(scholarship.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground z-10 hover:bg-destructive/90"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="text-center p-3 bg-muted/50 rounded-lg border border-border">
        <p className="font-semibold text-sm text-foreground truncate">{scholarship.name}</p>
        <p className="text-xs text-muted-foreground">{scholarship.provider}</p>
      </div>
    </motion.div>
  );
}

type CompareField = {
  label: string;
  icon: React.ElementType;
  render: (s: Scholarship) => React.ReactNode;
};

const compareFields: CompareField[] = [
  {
    label: "Funding Amount",
    icon: IndianRupee,
    render: (s) => <span className="font-bold text-primary text-lg">₹{s.amount.toLocaleString("en-IN")}</span>,
  },
  {
    label: "Deadline",
    icon: Calendar,
    render: (s) => {
      const days = getDaysLeft(s.deadline);
      return (
        <div>
          <p className="font-medium text-foreground">{new Date(s.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          <p className={`text-xs ${days <= 7 ? "text-red-500" : days <= 21 ? "text-yellow-500" : "text-green-500"}`}>
            {days > 0 ? `${days} days left` : "Expired"}
          </p>
        </div>
      );
    },
  },
  {
    label: "Provider Type",
    icon: Shield,
    render: (s) => <Badge className={providerColor[s.providerType]}>{s.providerType}</Badge>,
  },
  {
    label: "Competition Level",
    icon: Award,
    render: (s) => <Badge className={competitionColor[s.competitionLevel]}>{s.competitionLevel}</Badge>,
  },
  {
    label: "Education Levels",
    icon: GraduationCap,
    render: (s) => (
      <div className="flex flex-wrap gap-1">
        {(s.eligibility.educationLevels?.length ? s.eligibility.educationLevels : ["All"]).map((l) => (
          <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
        ))}
      </div>
    ),
  },
  {
    label: "Max Family Income",
    icon: IndianRupee,
    render: (s) => (
      <span className="text-foreground">
        {s.eligibility.maxIncome ? `₹${s.eligibility.maxIncome.toLocaleString("en-IN")}` : "No limit"}
      </span>
    ),
  },
  {
    label: "Min Percentage",
    icon: Award,
    render: (s) => (
      <span className="text-foreground">{s.eligibility.minPercentage ? `${s.eligibility.minPercentage}%` : "None"}</span>
    ),
  },
  {
    label: "Eligible Categories",
    icon: Shield,
    render: (s) => (
      <div className="flex flex-wrap gap-1">
        {(s.eligibility.categories?.length ? s.eligibility.categories : ["All"]).map((c) => (
          <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
        ))}
      </div>
    ),
  },
  {
    label: "Required Documents",
    icon: FileText,
    render: (s) => (
      <ul className="text-xs text-muted-foreground space-y-0.5">
        {s.requiredDocuments.map((d) => (
          <li key={d} className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary inline-block" />
            {d}
          </li>
        ))}
      </ul>
    ),
  },
];

export default function ScholarshipComparePage() {
  const { savedScholarships, toggleSaved } = useApp();
  const [selected, setSelected] = useState<(string | null)[]>([null, null]);

  const selectedScholarships = selected.map((id) =>
    id ? scholarships.find((s) => s.id === id) || null : null
  );

  const addSlot = () => {
    if (selected.length < 3) setSelected([...selected, null]);
  };

  const removeSlot = (index: number) => {
    if (selected.length <= 2) {
      setSelected(selected.map((s, i) => (i === index ? null : s)));
    } else {
      setSelected(selected.filter((_, i) => i !== index));
    }
  };

  const setSlot = (index: number, id: string) => {
    setSelected(selected.map((s, i) => (i === index ? id : s)));
  };

  const filledCount = selectedScholarships.filter(Boolean).length;
  const availableForSlot = (slotIndex: number) =>
    scholarships.filter((s) => !selected.includes(s.id) || selected[slotIndex] === s.id);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compare Scholarships</h1>
            <p className="text-muted-foreground text-sm">Select 2-3 scholarships to compare side by side.</p>
          </div>
        </div>
      </motion.div>

      {/* Selection Row */}
      <Card>
        <CardContent className="pt-6">
          <div className={`grid gap-4 ${selected.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {selected.map((id, i) => (
              <div key={i} className="space-y-2">
                <Select value={id || ""} onValueChange={(v) => setSlot(i, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Scholarship ${i + 1}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForSlot(i).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AnimatePresence>
                  {selectedScholarships[i] && (
                    <SlotCard scholarship={selectedScholarships[i]} onRemove={() => removeSlot(i)} index={i} />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          {selected.length < 3 && (
            <Button variant="outline" size="sm" className="mt-4" onClick={addSlot}>
              <Plus className="h-4 w-4 mr-1" /> Add 3rd Scholarship
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {filledCount >= 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-[180px]">Criteria</th>
                    {selectedScholarships.map((s, i) =>
                      s ? (
                        <th key={i} className="text-center py-3 px-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground text-sm">{s.name}</p>
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleSaved(s.id)}
                              >
                                {savedScholarships.includes(s.id) ? (
                                  <BookmarkCheck className="h-3.5 w-3.5 text-primary mr-1" />
                                ) : (
                                  <Bookmark className="h-3.5 w-3.5 mr-1" />
                                )}
                                {savedScholarships.includes(s.id) ? "Saved" : "Save"}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                                <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Apply
                                </a>
                              </Button>
                            </div>
                          </div>
                        </th>
                      ) : null
                    )}
                  </tr>
                </thead>
                <tbody>
                  {compareFields.map((field) => {
                    const Icon = field.icon;
                    return (
                      <tr key={field.label} className="border-t border-border">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon className="h-4 w-4" />
                            {field.label}
                          </div>
                        </td>
                        {selectedScholarships.map((s, i) =>
                          s ? (
                            <td key={i} className="py-3 px-4 text-center">
                              <div className="flex justify-center">{field.render(s)}</div>
                            </td>
                          ) : null
                        )}
                      </tr>
                    );
                  })}
                  {/* Description Row */}
                  <tr className="border-t border-border">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Description
                      </div>
                    </td>
                    {selectedScholarships.map((s, i) =>
                      s ? (
                        <td key={i} className="py-3 px-4">
                          <p className="text-xs text-muted-foreground text-center">{s.description}</p>
                        </td>
                      ) : null
                    )}
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
