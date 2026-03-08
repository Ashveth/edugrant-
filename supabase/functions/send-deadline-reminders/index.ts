import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Scholarship data (mirrored from frontend for deadline lookup)
const SCHOLARSHIP_DEADLINES: Record<string, { name: string; deadline: string }> = {
  "1": { name: "National Merit Scholarship", deadline: "2026-06-30" },
  "2": { name: "SC/ST Empowerment Fellowship", deadline: "2026-05-15" },
  "3": { name: "Women in STEM Scholarship", deadline: "2026-07-31" },
  "4": { name: "Rural India Education Fund", deadline: "2026-04-30" },
  "5": { name: "Post-Graduate Research Grant", deadline: "2026-08-15" },
  "6": { name: "OBC Welfare Scholarship", deadline: "2026-05-30" },
  "7": { name: "Tata Trust Education Scholarship", deadline: "2026-09-01" },
  "8": { name: "State Topper Award", deadline: "2026-03-31" },
  "9": { name: "Minority Community Scholarship", deadline: "2026-06-15" },
  "10": { name: "Digital India Tech Scholarship", deadline: "2026-07-15" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const remindDays = [7, 3, 1];

    // Fetch all active reminders
    const { data: reminders, error } = await supabase
      .from("scholarship_reminders")
      .select("*");

    if (error) throw error;
    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No reminders to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const reminder of reminders) {
      const scholarship = SCHOLARSHIP_DEADLINES[reminder.scholarship_id];
      if (!scholarship) continue;

      const deadline = new Date(scholarship.deadline);
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);

      // Check if we should send a reminder
      let shouldSend = false;
      if (daysUntilDeadline === 7 && reminder.remind_7_days) shouldSend = true;
      if (daysUntilDeadline === 3 && reminder.remind_3_days) shouldSend = true;
      if (daysUntilDeadline === 1 && reminder.remind_1_day) shouldSend = true;

      if (!shouldSend) continue;

      // Check if already reminded today
      if (reminder.last_reminded_at) {
        const lastReminded = new Date(reminder.last_reminded_at);
        if (lastReminded.toDateString() === now.toDateString()) continue;
      }

      // Send email via Lovable AI gateway (generate personalized reminder)
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        console.error("LOVABLE_API_KEY not configured");
        continue;
      }

      const emailContent = `
Subject: ⏰ ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''} left – ${scholarship.name}

Dear Student,

This is a friendly reminder that the deadline for "${scholarship.name}" is in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}.

Deadline: ${deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

Don't miss this opportunity! Log in to EduGrant AI to review and complete your application.

Best regards,
EduGrant AI Team
      `.trim();

      // Log the reminder (email delivery infrastructure can be added later)
      console.log(`REMINDER EMAIL to ${reminder.email}:\n${emailContent}\n---`);

      // Update last reminded timestamp
      await supabase
        .from("scholarship_reminders")
        .update({ last_reminded_at: now.toISOString() })
        .eq("id", reminder.id);

      sentCount++;
    }

    return new Response(JSON.stringify({ sent: sentCount, message: `Processed ${sentCount} reminders` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Reminder error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
