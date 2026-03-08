export interface StudentProfile {
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  category: "General" | "OBC" | "SC" | "ST";
  annualFamilyIncome: number;
  academicPercentage: number;
  educationLevel: "High School" | "Undergraduate" | "Postgraduate" | "Doctorate";
  fieldOfStudy: string;
  state: string;
  targetCourseCost: number;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string;
  description: string;
  eligibility: {
    maxIncome?: number;
    minPercentage?: number;
    categories?: string[];
    educationLevels?: string[];
    fieldsOfStudy?: string[];
    states?: string[];
    genders?: string[];
  };
  applicationUrl: string;
  requiredDocuments: string[];
  competitionLevel: "Low" | "Medium" | "High";
  providerType: "Government" | "NGO" | "CSR" | "Private";
  country?: string;
  fundingType?: string;
  university?: string;
  eligibilityCriteria?: string;
  applicationProcess?: string;
  tags?: string[];
}

export interface MatchResult {
  scholarship: Scholarship;
  matchPercentage: number;
  financialNeedScore: number;
  meritScore: number;
  approvalProbability: number;
  reasons: string[];
  badges: string[];
}
