import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { type, scholarshipName, fieldOfStudy, educationLevel, achievements, careerGoals, profile } = await req.json();

    const typeLabels: Record<string, string> = {
      sop: "Statement of Purpose",
      essay: "Scholarship Essay",
      recommendation: "Recommendation Letter",
    };

    const docType = typeLabels[type] || "Application Document";

    const profileContext = profile
      ? `Student Profile: ${profile.fullName || "N/A"}, ${profile.educationLevel || "N/A"} in ${profile.fieldOfStudy || "N/A"}, Academic: ${profile.academicPercentage || "N/A"}%, State: ${profile.state || "N/A"}, Category: ${profile.category || "N/A"}.`
      : "";

    const systemPrompt = `You are an expert academic writing advisor for Indian scholarship applicants. You provide STRUCTURAL OUTLINES and STRATEGIC SUGGESTIONS only — never full drafts.

Your role is to help students organize their thoughts and build strong application structures. You provide:
1. A clear section-by-section outline with bullet points for what to include
2. Key themes and angles to highlight
3. Common mistakes to avoid
4. Tone and style guidance
5. Word count recommendations per section

IMPORTANT: Do NOT write full paragraphs or complete content. Provide frameworks, key points, and strategic direction only. Use markdown formatting.`;

    const userPrompt = `Generate a structural outline and strategic suggestions for a ${docType}.

${profileContext}

Scholarship: ${scholarshipName || "General scholarship application"}
Field of Study: ${fieldOfStudy || "Not specified"}
Education Level: ${educationLevel || "Not specified"}
Key Achievements: ${achievements || "Not specified"}
Career Goals: ${careerGoals || "Not specified"}

Provide:
1. **Recommended Structure** — Section-by-section outline with bullet points
2. **Key Themes to Highlight** — What angles will make this application stand out
3. **Strategic Tips** — Specific advice for this type of document
4. **Common Pitfalls** — Mistakes to avoid
5. **Tone & Style Guide** — How the writing should feel
6. **Suggested Word Count** — Per section breakdown`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Application assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
