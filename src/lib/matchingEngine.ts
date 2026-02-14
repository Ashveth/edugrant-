import { StudentProfile, Scholarship, MatchResult } from "@/types/scholarship";

export function matchScholarships(
  profile: StudentProfile,
  scholarships: Scholarship[]
): MatchResult[] {
  return scholarships
    .map((s) => calculateMatch(profile, s))
    .filter((r) => r.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

function calculateMatch(profile: StudentProfile, scholarship: Scholarship): MatchResult {
  const reasons: string[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  // Income eligibility (30%)
  const incomeWeight = 30;
  totalWeight += incomeWeight;
  if (scholarship.eligibility.maxIncome) {
    if (profile.annualFamilyIncome <= scholarship.eligibility.maxIncome) {
      const ratio = 1 - profile.annualFamilyIncome / scholarship.eligibility.maxIncome;
      const score = 0.5 + ratio * 0.5;
      weightedScore += incomeWeight * score;
      reasons.push(`Your family income (₹${(profile.annualFamilyIncome / 100000).toFixed(1)}L) is within the ₹${(scholarship.eligibility.maxIncome / 100000).toFixed(1)}L limit`);
    } else {
      reasons.push(`Family income exceeds the ₹${(scholarship.eligibility.maxIncome / 100000).toFixed(1)}L limit`);
    }
  } else {
    weightedScore += incomeWeight;
    reasons.push("No income restriction");
  }

  // Academic performance (25%)
  const academicWeight = 25;
  totalWeight += academicWeight;
  if (scholarship.eligibility.minPercentage) {
    if (profile.academicPercentage >= scholarship.eligibility.minPercentage) {
      const excess = profile.academicPercentage - scholarship.eligibility.minPercentage;
      const score = 0.6 + Math.min(excess / 20, 1) * 0.4;
      weightedScore += academicWeight * score;
      reasons.push(`Your academic score (${profile.academicPercentage}%) exceeds the minimum ${scholarship.eligibility.minPercentage}%`);
    } else {
      reasons.push(`Academic score below the required ${scholarship.eligibility.minPercentage}%`);
    }
  } else {
    weightedScore += academicWeight * 0.7;
  }

  // Category (20%)
  const categoryWeight = 20;
  totalWeight += categoryWeight;
  const cats = scholarship.eligibility.categories;
  if (!cats || cats.length === 0 || cats.includes(profile.category)) {
    weightedScore += categoryWeight;
    if (cats && cats.length > 0 && cats.length < 4) {
      reasons.push(`Your category (${profile.category}) is specifically targeted`);
    } else {
      reasons.push("Open to all categories");
    }
  } else {
    reasons.push(`Category ${profile.category} is not eligible`);
  }

  // Education level (10%)
  const eduWeight = 10;
  totalWeight += eduWeight;
  const levels = scholarship.eligibility.educationLevels;
  if (!levels || levels.length === 0 || levels.includes(profile.educationLevel)) {
    weightedScore += eduWeight;
    reasons.push(`Your education level (${profile.educationLevel}) matches`);
  } else {
    reasons.push(`Education level ${profile.educationLevel} not eligible`);
  }

  // Field of study (10%)
  const fieldWeight = 10;
  totalWeight += fieldWeight;
  const fields = scholarship.eligibility.fieldsOfStudy;
  if (!fields || fields.length === 0 || fields.includes(profile.fieldOfStudy)) {
    weightedScore += fieldWeight;
    if (fields && fields.length > 0) {
      reasons.push(`Your field (${profile.fieldOfStudy}) is a target discipline`);
    }
  } else {
    reasons.push(`Field ${profile.fieldOfStudy} not among preferred disciplines`);
  }

  // State/location (5%)
  const stateWeight = 5;
  totalWeight += stateWeight;
  const states = scholarship.eligibility.states;
  if (!states || states.length === 0 || states.includes(profile.state)) {
    weightedScore += stateWeight;
    if (states && states.length > 0) {
      reasons.push(`Your state (${profile.state}) qualifies for this regional scholarship`);
    }
  } else {
    reasons.push(`State ${profile.state} not in eligible regions`);
  }

  // Gender check (disqualifier)
  const genders = scholarship.eligibility.genders;
  if (genders && genders.length > 0 && !genders.includes(profile.gender)) {
    return {
      scholarship, matchPercentage: 0, financialNeedScore: 0, meritScore: 0, approvalProbability: 0,
      reasons: [`This scholarship is only for ${genders.join("/")} applicants`], badges: [],
    };
  }

  const matchPercentage = Math.round((weightedScore / totalWeight) * 100);
  const financialNeedScore = Math.round(Math.max(0, Math.min(100, 100 - (profile.annualFamilyIncome / 1200000) * 100)));
  const meritScore = Math.round(Math.min(100, profile.academicPercentage * 1.05));
  const approvalProbability = Math.round(matchPercentage * 0.5 + financialNeedScore * 0.2 + meritScore * 0.3);

  // Generate badges
  const badges: string[] = [];
  if (approvalProbability >= 75) badges.push("🔥 High Approval");
  if (scholarship.amount >= profile.targetCourseCost * 0.5) badges.push("💰 High Coverage");
  if (matchPercentage >= 85) badges.push("🎯 Perfect Match");
  if (scholarship.competitionLevel === "High") badges.push("⚠️ Competitive");

  return {
    scholarship, matchPercentage, financialNeedScore, meritScore,
    approvalProbability: Math.min(98, approvalProbability),
    reasons: reasons.filter(
      (r) =>
        !r.startsWith("Family income exceeds") &&
        !r.startsWith("Academic score below") &&
        !r.startsWith("Category ") &&
        !r.startsWith("Education level ") &&
        !r.startsWith("Field ") &&
        !r.startsWith("State ")
    ),
    badges,
  };
}
