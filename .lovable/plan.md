

# AI Fake Document Analyzer

## Overview
Add a new AI tool page at `/dashboard/ai/document-analyzer` that lets students upload documents (marksheets, income certificates, IDs, etc.) and get an AI-powered authenticity analysis with a verdict (Verified / Suspicious / Potentially Fake).

## Architecture

```text
┌─────────────────┐     ┌──────────────────────────┐     ┌──────────────┐
│  Frontend Page   │────▶│  Edge Function            │────▶│ Lovable AI   │
│  Upload + Display│     │  document-analyzer/       │     │ Gemini Vision│
│                  │◀────│  Accepts base64 file      │◀────│              │
└─────────────────┘     └──────────────────────────┘     └──────────────┘
```

## Implementation

### 1. Edge Function: `supabase/functions/document-analyzer/index.ts`
- Accept file as base64 + file type + document category
- Send to Lovable AI using `google/gemini-2.5-flash` (supports image+text multimodal)
- System prompt instructs AI to analyze for: metadata inconsistencies, formatting anomalies, image manipulation signs, data consistency (GPA ranges, dates), and return structured JSON
- Return verdict (`verified` / `suspicious` / `potentially_fake`), confidence score, list of findings, and recommendation
- Handle 429/402 rate limit errors

### 2. Frontend Page: `src/pages/DocumentAnalyzerPage.tsx`
- Document type selector (Marksheet, Income Certificate, ID Proof, Recommendation Letter, Certificate, Resume)
- File upload area (drag-and-drop + click) accepting PDF/images
- Loading state with "Analyzing document authenticity using AI..." message
- Results display:
  - Color-coded verdict badge (green/yellow/red)
  - Confidence percentage bar
  - Findings list (red flags and green flags)
  - Analysis breakdown (text, image, data consistency checks)
  - Explanation summary
  - Recommendation
- Actions: re-upload, download report (as text summary)
- Benefits callout card explaining why verification matters

### 3. Routing & Navigation
- Add route `/dashboard/ai/document-analyzer` in `App.tsx`
- Add "Document Analyzer" entry to `aiTools` array in `AppSidebar.tsx` with `FileSearch` or `ScanSearch` icon
- Update `supabase/config.toml` with `[functions.document-analyzer]` and `verify_jwt = false`

### Technical Notes
- Uses `google/gemini-2.5-flash` for multimodal (image+text) analysis capability
- Files converted to base64 on client before sending to edge function
- Max file size enforced at 10MB client-side
- No database changes needed -- analysis is stateless per request
- Download report generates a simple text/markdown summary client-side

