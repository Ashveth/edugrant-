

## Plan: Enhanced AI Scholarship Tools

### What Already Exists
- Basic document checklist (localStorage, no uploads, no per-scholarship tracking in DB)
- Approval probability on scholarship cards/detail pages
- "Recommended Scholarships" section on dashboard (simple top-4 grid)
- Scam Detector page (fully functional)

### What We'll Build

#### 1. Enhanced Document Checklist (ScholarshipDetailPage)
- Replace the simple toggle list with a richer card layout per document
- Add a progress bar ("3/6 documents ready") with motivational message
- Add file upload button next to each checklist item (upload to existing `user-documents` storage bucket)
- Save checklist completion state to a new `scholarship_doc_checklist` DB table (per user, per scholarship, per document)
- Show upload status (uploaded file name) next to each item

**Database migration:**
```sql
CREATE TABLE public.scholarship_doc_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scholarship_id text NOT NULL,
  document_name text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, scholarship_id, document_name)
);
ALTER TABLE public.scholarship_doc_checklist ENABLE ROW LEVEL SECURITY;
-- RLS: users can CRUD own rows
```

#### 2. Success Rate Badge on Scholarship Cards
- Add a colored badge component to `ScholarshipCard` in ScholarshipsPage showing approval probability level:
  - Green "High Chance" (>=70%), Yellow "Medium Chance" (40-69%), Red "Competitive" (<40%)
- Add the same badge to ScholarshipDetailPage header
- Add an AI tips section on ScholarshipDetailPage using the existing `success-predictor` edge function (call it inline for the selected scholarship)

#### 3. Netflix-Style Recommendation Feed (DashboardHome)
- Refactor DashboardHome "Recommended Scholarships" into horizontal scroll sections:
  - "Recommended for You" (top matches)
  - "Expiring Soon" (deadline within 30 days, sorted by urgency)
  - "Top for [Student's Field]" (filtered by field of study)
- Each section: horizontal scroll with compact scholarship cards (name, amount, deadline, match score, save/apply buttons)
- Create a reusable `ScholarshipScrollSection` component

#### 4. Scam Detector Enhancement
- Already functional. Minor enhancement: add tips section at the bottom with common scam warning signs (static content, no AI call needed).

### Files to Create/Edit
- **Create**: `src/components/ScholarshipScrollSection.tsx` (reusable horizontal scroll)
- **Create**: `src/components/SuccessBadge.tsx` (colored probability badge)
- **Edit**: `src/pages/ScholarshipDetailPage.tsx` (enhanced doc checklist with uploads + success badge + AI tips)
- **Edit**: `src/pages/ScholarshipsPage.tsx` (add SuccessBadge to cards)
- **Edit**: `src/pages/DashboardHome.tsx` (Netflix-style recommendation sections)
- **Edit**: `src/pages/ScamDetectorPage.tsx` (add static tips section)
- **Edit**: `src/context/AppContext.tsx` (add scholarship doc checklist DB methods)
- **Database migration**: `scholarship_doc_checklist` table with RLS

### Technical Notes
- File uploads use existing `user-documents` storage bucket with existing RLS
- Document checklist moves from localStorage to database for persistence
- Success badge is purely client-side using existing `matchScholarships` engine (no extra API call for the badge itself)
- Horizontal scroll sections use CSS `overflow-x-auto` with snap scrolling

