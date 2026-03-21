import { motion } from "framer-motion";
import { FileText, CheckCircle2, Circle, Search, FolderOpen, AlertCircle, Clock, Upload, Download, Trash2, Loader2, Paperclip, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useScholarshipsFromDB } from "@/hooks/useScholarshipsFromDB";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UploadedDoc {
  id: string;
  document_name: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
}

export default function DocumentsPage() {
  const { savedScholarships, documentChecklist, toggleDocument, userId } = useApp();
  const { scholarships } = useScholarshipsFromDB();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "ready">("all");
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customDocs, setCustomDocs] = useState<string[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [showAddDoc, setShowAddDoc] = useState(false);
  const { toast } = useToast();

  // Fetch uploaded documents
  useEffect(() => {
    if (!userId) return;
    const fetchDocs = async () => {
      const { data } = await supabase
        .from("user_documents")
        .select("*")
        .order("uploaded_at", { ascending: false });
      if (data) setUploadedDocs(data as UploadedDoc[]);
    };
    fetchDocs();
  }, [userId]);

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

  const getUploadedFile = (docName: string) => uploadedDocs.find(d => d.document_name === docName);

  const handleUploadClick = (docName: string) => {
    setUploadingFor(docName);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor || !userId) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
      setUploadingFor(null);
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF, JPG, PNG, or WebP file", variant: "destructive" });
      setUploadingFor(null);
      return;
    }

    const filePath = `${userId}/${uploadingFor.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.${file.name.split(".").pop()}`;

    // Delete old file if exists
    const existing = getUploadedFile(uploadingFor);
    if (existing) {
      await supabase.storage.from("user-documents").remove([existing.file_path]);
      await supabase.from("user_documents").delete().eq("id", existing.id);
    }

    const { error: uploadError } = await supabase.storage.from("user-documents").upload(filePath, file);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingFor(null);
      return;
    }

    const { error: dbError } = await supabase.from("user_documents").insert({
      user_id: userId,
      document_name: uploadingFor,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
    });

    if (dbError) {
      toast({ title: "Failed to save record", description: dbError.message, variant: "destructive" });
      setUploadingFor(null);
      return;
    }

    // Refresh
    const { data } = await supabase.from("user_documents").select("*").order("uploaded_at", { ascending: false });
    if (data) setUploadedDocs(data as UploadedDoc[]);

    // Auto-mark as ready
    if (!documentChecklist[uploadingFor]) toggleDocument(uploadingFor);

    toast({ title: "Document uploaded!", description: file.name });
    setUploadingFor(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (doc: UploadedDoc) => {
    const { data } = await supabase.storage.from("user-documents").download(doc.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = async (doc: UploadedDoc) => {
    await supabase.storage.from("user-documents").remove([doc.file_path]);
    await supabase.from("user_documents").delete().eq("id", doc.id);
    setUploadedDocs(prev => prev.filter(d => d.id !== doc.id));
    toast({ title: "Document deleted" });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6">
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileChange} />

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and upload required documents across {savedScholarships.length > 0 ? "your saved" : "all"} scholarships
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
          <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "ready"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
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
                {allDocs.length === 0 ? "Save some scholarships to see required documents here." : "No documents match your filter."}
              </p>
            </CardContent>
          </Card>
        )}

        {filteredDocs.map((doc, i) => {
          const isReady = !!documentChecklist[doc];
          const neededBy = documentMap[doc];
          const uploaded = getUploadedFile(doc);
          const isUploading = uploadingFor === doc;

          return (
            <motion.div key={doc} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`shadow-card transition-all hover:shadow-md ${isReady ? "border-primary/30 bg-primary/5" : ""}`}>
                <CardContent className="py-4 flex items-start gap-4">
                  <button onClick={() => toggleDocument(doc)} className="mt-0.5 shrink-0">
                    {isReady ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{doc}</p>

                    {/* Uploaded file info */}
                    {uploaded && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-foreground truncate flex-1">{uploaded.file_name}</span>
                        <span className="text-[10px] text-muted-foreground">{formatSize(uploaded.file_size)}</span>
                        <button onClick={() => handleDownload(uploaded)} className="text-primary hover:text-primary/80 transition-colors" title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(uploaded)} className="text-destructive hover:text-destructive/80 transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={isReady ? "default" : "outline"} className={`text-[10px] ${isReady ? "bg-primary text-primary-foreground" : ""}`}>
                      {isReady ? "Ready" : "Pending"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5"
                      onClick={() => handleUploadClick(doc)}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      <span className="ml-1">{uploaded ? "Replace" : "Upload"}</span>
                    </Button>
                  </div>
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
                Upload scanned copies in PDF or image format (max 5MB). Your files are securely stored and only accessible by you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
