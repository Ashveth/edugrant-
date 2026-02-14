import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StudentProfile } from "@/types/scholarship";

interface AppContextType {
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile) => void;
  savedScholarships: string[];
  toggleSaved: (id: string) => void;
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  signup: (email: string, password: string, name: string) => void;
  logout: () => void;
  userEmail: string;
  darkMode: boolean;
  toggleDarkMode: () => void;
  documentChecklist: Record<string, boolean>;
  toggleDocument: (doc: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem("edugrant_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [savedScholarships, setSaved] = useState<string[]>(() => {
    const s = localStorage.getItem("edugrant_saved");
    return s ? JSON.parse(s) : [];
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("edugrant_user"));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("edugrant_user") || "");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("edugrant_dark") === "true");
  const [documentChecklist, setDocumentChecklist] = useState<Record<string, boolean>>(() => {
    const d = localStorage.getItem("edugrant_docs");
    return d ? JSON.parse(d) : {};
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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

  const login = (email: string, _password: string) => {
    localStorage.setItem("edugrant_user", email);
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const signup = (email: string, _password: string, name: string) => {
    localStorage.setItem("edugrant_user", email);
    setIsLoggedIn(true);
    setUserEmail(email);
    if (!profile) {
      setProfile({ fullName: name, age: 18, gender: "Male", category: "General", annualFamilyIncome: 300000, academicPercentage: 75, educationLevel: "Undergraduate", fieldOfStudy: "Engineering", state: "Maharashtra", targetCourseCost: 500000 });
    }
  };

  const logout = () => {
    localStorage.removeItem("edugrant_user");
    setIsLoggedIn(false);
    setUserEmail("");
  };

  return (
    <AppContext.Provider value={{ profile, setProfile, savedScholarships, toggleSaved, isLoggedIn, login, signup, logout, userEmail, darkMode, toggleDarkMode, documentChecklist, toggleDocument }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
