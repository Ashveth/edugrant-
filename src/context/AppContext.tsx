import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { StudentProfile } from "@/types/scholarship";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export interface Application {
  id: string;
  scholarship_id: string;
  status: "draft" | "applied" | "pending" | "accepted" | "rejected";
  notes: string;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile) => Promise<void>;
  savedScholarships: string[];
  toggleSaved: (id: string) => void;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => void;
  userEmail: string;
  userId: string | null;
  darkMode: boolean;
  toggleDarkMode: () => void;
  documentChecklist: Record<string, boolean>;
  toggleDocument: (doc: string) => void;
  session: Session | null;
  applications: Application[];
  addApplication: (scholarshipId: string) => Promise<void>;
  updateApplication: (id: string, updates: Partial<Pick<Application, "status" | "notes">>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  loadingData: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const [profile, setProfileState] = useState<StudentProfile | null>(null);
  const [savedScholarships, setSaved] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("edugrant_dark") === "true");
  const [documentChecklist, setDocumentChecklist] = useState<Record<string, boolean>>(() => {
    const d = localStorage.getItem("edugrant_docs");
    return d ? JSON.parse(d) : {};
  });

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from DB when logged in
  useEffect(() => {
    if (!user) {
      setProfileState(null);
      setSaved([]);
      setApplications([]);
      return;
    }

    const loadData = async () => {
      setLoadingData(true);
      try {
        // Load student profile
        const { data: sp } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (sp) {
          setProfileState({
            fullName: sp.full_name,
            age: sp.age,
            gender: sp.gender as StudentProfile["gender"],
            category: sp.category as StudentProfile["category"],
            annualFamilyIncome: sp.annual_family_income,
            academicPercentage: Number(sp.academic_percentage),
            educationLevel: sp.education_level as StudentProfile["educationLevel"],
            fieldOfStudy: sp.field_of_study,
            state: sp.state,
            targetCourseCost: sp.target_course_cost,
          });
        }

        // Load saved scholarships
        const { data: ss } = await supabase
          .from("saved_scholarships")
          .select("scholarship_id")
          .eq("user_id", user.id);

        if (ss) setSaved(ss.map((s) => s.scholarship_id));

        // Load applications
        const { data: apps } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (apps) setApplications(apps as Application[]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const isLoggedIn = !!user;
  const userEmail = user?.email || "";
  const userId = user?.id || null;

  const setProfile = async (p: StudentProfile) => {
    setProfileState(p);
    if (!user) return;

    const row = {
      user_id: user.id,
      full_name: p.fullName,
      age: p.age,
      gender: p.gender,
      category: p.category,
      annual_family_income: p.annualFamilyIncome,
      academic_percentage: p.academicPercentage,
      education_level: p.educationLevel,
      field_of_study: p.fieldOfStudy,
      state: p.state,
      target_course_cost: p.targetCourseCost,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("student_profiles").upsert(row, { onConflict: "user_id" });
  };

  const toggleSaved = useCallback(async (id: string) => {
    if (!user) return;
    const isSaved = savedScholarships.includes(id);

    if (isSaved) {
      setSaved((prev) => prev.filter((s) => s !== id));
      await supabase.from("saved_scholarships").delete().eq("user_id", user.id).eq("scholarship_id", id);
    } else {
      setSaved((prev) => [...prev, id]);
      await supabase.from("saved_scholarships").insert({ user_id: user.id, scholarship_id: id });
    }
  }, [user, savedScholarships]);

  const addApplication = async (scholarshipId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("applications")
      .insert({ user_id: user.id, scholarship_id: scholarshipId, status: "draft" })
      .select()
      .single();

    if (data && !error) setApplications((prev) => [data as Application, ...prev]);
  };

  const updateApplication = async (id: string, updates: Partial<Pick<Application, "status" | "notes">>) => {
    if (!user) return;
    const updateData: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
    if (updates.status === "applied") updateData.applied_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (data && !error) {
      setApplications((prev) => prev.map((a) => (a.id === id ? (data as Application) : a)));
    }
  };

  const deleteApplication = async (id: string) => {
    if (!user) return;
    await supabase.from("applications").delete().eq("id", id).eq("user_id", user.id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("edugrant_dark", String(!prev));
      return !prev;
    });
  };

  const toggleDocument = (doc: string) => {
    setDocumentChecklist((prev) => {
      const next = { ...prev, [doc]: !prev[doc] };
      localStorage.setItem("edugrant_docs", JSON.stringify(next));
      return next;
    });
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ profile, setProfile, savedScholarships, toggleSaved, isLoggedIn, login, signup, logout, userEmail, userId, darkMode, toggleDarkMode, documentChecklist, toggleDocument, session, applications, addApplication, updateApplication, deleteApplication, loadingData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
