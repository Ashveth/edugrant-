import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileBase64, fileType, documentCategory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!fileBase64 || !documentCategory) {
      return new Response(JSON.stringify({ error: "Missing file or document category" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert document fraud analyst. You analyze uploaded documents for authenticity and detect potential manipulation or fraud.

Given a document image/file of type "${documentCategory}", perform a thorough analysis covering:

1. **Text & Metadata Analysis**: Check for inconsistent fonts, misaligned text, unusual spacing, copy-paste artifacts, or metadata anomalies.
2. **Image Manipulation Detection**: Look for signs of Photoshop, pixel inconsistencies, altered signatures/stamps/seals, JPEG artifacts around edited areas, inconsistent lighting/shadows.
3. **Data Consistency Check**: Verify realistic score ranges (e.g., GPA 0-10 or percentage 0-100), proper date formats, consistent naming, matching institution details, realistic income figures for income certificates.
4. **Format & Structure**: Check if the document follows standard institutional formatting, proper letterhead usage, correct seal/stamp placement, standard certificate layouts.
5. **Duplicate/Template Detection**: Look for signs of mass-produced fake documents or common fraud templates.

Return ONLY a valid JSON object with this structure:
{
  "verdict": "verified" | "suspicious" | "potentially_fake",
  "confidence": <number 0-100>,
  "redFlags": ["specific concern 1", "specific concern 2"],
  "greenFlags": ["positive indicator 1", "positive indicator 2"],
  "analysis": {
    "textMetadata": { "status": "pass" | "warning" | "fail", "details": "explanation" },
    "imageManipulation": { "status": "pass" | "warning" | "fail", "details": "explanation" },
    "dataConsistency": { "status": "pass" | "warning" | "fail", "details": "explanation" },
    "formatStructure": { "status": "pass" | "warning" | "fail", "details": "explanation" }
  },
  "explanation": "3-4 sentence summary of the overall verdict",
  "recommendation": "What the student should do next"
}

Be thorough but fair. Not every imperfection means fraud - consider scanning artifacts, image compression, etc. Return ONLY valid JSON.`;

    const isImage = fileType?.startsWith("image/");
    const mimeType = fileType || "application/pdf";

    const userContent: any[] = [
      { type: "text", text: `Analyze this ${documentCategory} document for authenticity. Detect any signs of manipulation, forgery, or inconsistency.` },
    ];

    if (isImage) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${fileBase64}` },
      });
    } else {
      userContent.push({
        type: "text",
        text: `[Document provided as base64 ${mimeType} - analyzing available text and structure]\nBase64 data length: ${fileBase64.length} characters`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
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
    console.error("document-analyzer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
