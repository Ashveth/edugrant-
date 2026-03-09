import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "retrying" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const maxAttempts = 8;

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (attempt < maxAttempts) {
        setStatus("retrying");
        setTimeout(() => {
          if (!cancelled) setAttempt((a) => a + 1);
        }, 800);
      } else {
        setStatus("error");
      }
    };

    checkSession();

    return () => { cancelled = true; };
  }, [attempt, navigate]);

  // Also listen for auth state changes as a parallel signal
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-6 px-6">
      <div className="flex items-center gap-2.5">
        <GraduationCap className="h-8 w-8 text-primary" />
        <span className="font-display text-xl font-bold text-foreground tracking-tight">EduGrant AI</span>
      </div>

      {status === "error" ? (
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-muted-foreground text-sm">
            We couldn't verify your session. This can happen on slow connections.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setAttempt(0); setStatus("loading"); }}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            {status === "retrying" ? "Almost there, verifying your account..." : "Signing you in..."}
          </p>
        </div>
      )}
    </div>
  );
}
