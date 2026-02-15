import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StudentProfile } from "@/types/scholarship";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AppContextType {
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfileState] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem("edugrant_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [savedScholarships, setSaved] = useState<string[]>(() => {
    const s = localStorage.getItem("edugrant_saved");
    return s ? JSON.parse(s) : [];
  });
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const isLoggedIn = !!user;
  const userEmail = user?.email || "";
  const userId = user?.id || null;

  const setProfile = (p: StudentProfile) => {
    setProfileState(p);
    localStorage.setItem("edugrant_profile", JSON.stringify(p));
  };

  const toggleSaved = (id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      localStorage.setItem("edugrant_saved", JSON.stringify(next));
      return next;
    });
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
    <AppContext.Provider value={{ profile, setProfile, savedScholarships, toggleSaved, isLoggedIn, login, signup, logout, userEmail, userId, darkMode, toggleDarkMode, documentChecklist, toggleDocument, session }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
