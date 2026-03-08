import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, details } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an AI scholarship scam detector. Analyze the provided scholarship information (URL, description, or details) and determine if it's legitimate.

Return a JSON object with:
{
  "verdict": "verified" | "suspicious" | "potential_scam",
  "confidence": number (0-100),
  "redFlags": ["string - specific concerns found"],
  "greenFlags": ["string - positive legitimacy indicators"],
  "analysis": {
    "websiteAuthenticity": "safe" | "questionable" | "dangerous",
    "applicationFees": "none" | "reasonable" | "suspicious",
    "emailCredibility": "legitimate" | "questionable" | "fake",
    "organizationVerified": boolean
  },
  "explanation": "A 3-4 sentence summary explaining the verdict",
  "recommendation": "string - what the student should do"
}

Common scam indicators:
- Asking for application fees or processing charges
- Gmail/Yahoo emails instead of institutional emails
- Vague eligibility criteria
- Too-good-to-be-true amounts
- No verifiable organization
- Pressure tactics or urgency
- Requesting bank details upfront

Known legitimate portals: scholarships.gov.in, buddy4study.com, vidyasaarathi.co.in, aicte-india.org

Return ONLY valid JSON.`;

    const userMessage = url
      ? `Analyze this scholarship URL for legitimacy: ${url}\n\nAdditional details provided: ${details || "None"}`
      : `Analyze these scholarship details for legitimacy:\n${details}`;

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
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsed = { error: "Could not parse AI response", raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scam-detector error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
