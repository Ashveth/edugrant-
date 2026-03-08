import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date();

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
    const errors: string[] = [];

    for (const reminder of reminders) {
      const scholarship = SCHOLARSHIP_DEADLINES[reminder.scholarship_id];
      if (!scholarship) continue;

      const deadline = new Date(scholarship.deadline);
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);

      let shouldSend = false;
      if (daysUntilDeadline === 7 && reminder.remind_7_days) shouldSend = true;
      if (daysUntilDeadline === 3 && reminder.remind_3_days) shouldSend = true;
      if (daysUntilDeadline === 1 && reminder.remind_1_day) shouldSend = true;

      if (!shouldSend) continue;

      if (reminder.last_reminded_at) {
        const lastReminded = new Date(reminder.last_reminded_at);
        if (lastReminded.toDateString() === now.toDateString()) continue;
      }

      const deadlineFormatted = deadline.toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Deadline Reminder</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1f2937; margin-top: 0;">${scholarship.name}</h2>
            <p style="color: #4b5563; font-size: 16px;">
              You have <strong style="color: #ef4444;">${daysUntilDeadline} day${daysUntilDeadline > 1 ? "s" : ""}</strong> left to apply!
            </p>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; color: #6b7280;">📅 <strong>Deadline:</strong> ${deadlineFormatted}</p>
            </div>
            <p style="color: #4b5563;">Don't miss this opportunity! Log in to EduGrant AI to review and complete your application.</p>
            <a href="https://edugrantai.lovable.app/dashboard/scholarships" 
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Apply Now →
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
            EduGrant AI — Never miss a scholarship deadline
          </p>
        </div>
      `;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EduGrant AI <onboarding@resend.dev>",
            to: [reminder.email],
            subject: `⏰ ${daysUntilDeadline} day${daysUntilDeadline > 1 ? "s" : ""} left – ${scholarship.name}`,
            html: htmlContent,
          }),
        });

        const resData = await res.json();

        if (!res.ok) {
          console.error(`Resend API error for ${reminder.email}:`, resData);
          errors.push(`Failed to send to ${reminder.email}: ${JSON.stringify(resData)}`);
          continue;
        }

        console.log(`Email sent to ${reminder.email} for ${scholarship.name} (${daysUntilDeadline} days left)`);

        await supabase
          .from("scholarship_reminders")
          .update({ last_reminded_at: now.toISOString() })
          .eq("id", reminder.id);

        sentCount++;
      } catch (emailErr) {
        console.error(`Email send error for ${reminder.email}:`, emailErr);
        errors.push(`Error sending to ${reminder.email}: ${emailErr instanceof Error ? emailErr.message : "Unknown"}`);
      }
    }

    return new Response(JSON.stringify({ 
      sent: sentCount, 
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent ${sentCount} reminder emails` 
    }), {
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
