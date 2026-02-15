import { motion } from "framer-motion";
import { FileText, CheckCircle2, Circle, Search, Filter, FolderOpen, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { scholarships } from "@/data/scholarships";
import { useState, useMemo } from "react";

export default function DocumentsPage() {
  const { savedScholarships, documentChecklist, toggleDocument } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "ready">("all");

  // Collect all unique documents from saved scholarships (or all if none saved)
  const relevantScholarships = savedScholarships.length > 0
    ? scholarships.filter(s => savedScholarships.includes(s.id))
    : scholarships;

  const documentMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    relevantScholarships.forEach(s => {
      s.requiredDocuments.forEach(doc => {
        if (!map[doc]) map[doc] = [];
        if (!map[doc].includes(s.name)) map[doc].push(s.name);
      });
    });
    return map;
  }, [relevantScholarships]);

  const allDocs = Object.keys(documentMap);
  const readyCount = allDocs.filter(d => documentChecklist[d]).length;
  const progressPercent = allDocs.length > 0 ? Math.round((readyCount / allDocs.length) * 100) : 0;

  const filteredDocs = allDocs
    .filter(doc => {
      if (filter === "ready") return documentChecklist[doc];
      if (filter === "pending") return !documentChecklist[doc];
      return true;
    })
    .filter(doc => doc.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all required documents across {savedScholarships.length > 0 ? "your saved" : "all"} scholarships
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <span className="font-display font-semibold text-foreground">Document Readiness</span>
            </div>
            <span className="text-sm font-bold text-primary">{readyCount}/{allDocs.length}</span>
          </div>
          <Progress value={progressPercent} className="h-3 mb-2" />
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> {readyCount} Ready</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-destructive" /> {allDocs.length - readyCount} Pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "ready"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {allDocs.length === 0
                  ? "Save some scholarships to see required documents here."
                  : "No documents match your filter."}
              </p>
            </CardContent>
          </Card>
        )}

        {filteredDocs.map((doc, i) => {
          const isReady = !!documentChecklist[doc];
          const neededBy = documentMap[doc];

          return (
            <motion.div
              key={doc}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={`shadow-card cursor-pointer transition-all hover:shadow-md ${
                  isReady ? "border-primary/30 bg-primary/5" : ""
                }`}
                onClick={() => toggleDocument(doc)}
              >
                <CardContent className="py-4 flex items-start gap-4">
                  <div className="mt-0.5">
                    {isReady
                      ? <CheckCircle2 className="h-5 w-5 text-primary" />
                      : <Circle className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isReady ? "text-foreground" : "text-foreground"}`}>
                      {doc}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {neededBy.map(name => (
                        <Badge key={name} variant="secondary" className="text-[10px] font-normal">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant={isReady ? "default" : "outline"} className={`shrink-0 text-[10px] ${isReady ? "bg-primary text-primary-foreground" : ""}`}>
                    {isReady ? "Ready" : "Pending"}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tip */}
      {allDocs.length > 0 && (
        <Card className="shadow-card border-primary/20 bg-primary/5">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Pro Tip</p>
              <p className="text-xs text-muted-foreground mt-1">
                Keep digital copies of all documents ready. Most scholarship portals accept scanned copies in PDF format (under 2MB each).
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
