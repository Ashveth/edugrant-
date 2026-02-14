import { Scholarship } from "@/types/scholarship";

export const scholarships: Scholarship[] = [
  {
    id: "1", name: "National Merit Scholarship", provider: "Ministry of Education", amount: 50000,
    deadline: "2026-06-30", description: "Merit-based scholarship for academically outstanding students across India.",
    eligibility: { maxIncome: 600000, minPercentage: 80, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: ["Engineering","Science","Medicine","Arts","Commerce"], states: [] },
    applicationUrl: "https://scholarships.gov.in/", requiredDocuments: ["Income Certificate","Marksheets","Aadhaar Card","Bank Passbook"], competitionLevel: "High", providerType: "Government",
  },
  {
    id: "2", name: "SC/ST Empowerment Fellowship", provider: "Ministry of Social Justice", amount: 75000,
    deadline: "2026-05-15", description: "Financial support for SC/ST students pursuing higher education.",
    eligibility: { maxIncome: 400000, minPercentage: 60, categories: ["SC","ST"], educationLevels: ["Undergraduate","Postgraduate","Doctorate"], fieldsOfStudy: [], states: [] },
    applicationUrl: "https://scholarships.gov.in/", requiredDocuments: ["Caste Certificate","Income Certificate","Marksheets","Aadhaar Card"], competitionLevel: "Low", providerType: "Government",
  },
  {
    id: "3", name: "Women in STEM Scholarship", provider: "AICTE", amount: 100000,
    deadline: "2026-07-31", description: "Empowering female students in Science, Technology, Engineering & Mathematics.",
    eligibility: { maxIncome: 800000, minPercentage: 75, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: ["Engineering","Science","Technology","Mathematics"], genders: ["Female"], states: [] },
    applicationUrl: "https://www.aicte-india.org/bureaus/scholarship", requiredDocuments: ["Marksheets","Income Certificate","ID Proof","Recommendation Letter"], competitionLevel: "Medium", providerType: "Government",
  },
  {
    id: "4", name: "Rural India Education Fund", provider: "NABARD Foundation", amount: 40000,
    deadline: "2026-04-30", description: "Supporting students from rural areas with limited financial means.",
    eligibility: { maxIncome: 300000, minPercentage: 55, categories: ["General","OBC","SC","ST"], educationLevels: ["High School","Undergraduate"], fieldsOfStudy: [], states: ["Uttar Pradesh","Bihar","Madhya Pradesh","Rajasthan","Odisha","Jharkhand","Chhattisgarh"] },
    applicationUrl: "https://www.nabard.org/", requiredDocuments: ["Domicile Certificate","Income Certificate","Marksheets","Aadhaar Card"], competitionLevel: "Low", providerType: "NGO",
  },
  {
    id: "5", name: "Post-Graduate Research Grant", provider: "UGC", amount: 200000,
    deadline: "2026-08-15", description: "Research funding for postgraduate and doctoral students.",
    eligibility: { maxIncome: 1000000, minPercentage: 70, categories: ["General","OBC","SC","ST"], educationLevels: ["Postgraduate","Doctorate"], fieldsOfStudy: [], states: [] },
    applicationUrl: "https://www.ugc.gov.in/scholarships.aspx", requiredDocuments: ["Marksheets","Research Proposal","Recommendation Letter","ID Proof"], competitionLevel: "High", providerType: "Government",
  },
  {
    id: "6", name: "OBC Welfare Scholarship", provider: "State Welfare Department", amount: 35000,
    deadline: "2026-05-30", description: "Financial assistance for OBC students.",
    eligibility: { maxIncome: 500000, minPercentage: 50, categories: ["OBC"], educationLevels: ["High School","Undergraduate","Postgraduate"], fieldsOfStudy: [], states: [] },
    applicationUrl: "https://scholarships.gov.in/", requiredDocuments: ["OBC Certificate","Income Certificate","Marksheets","Aadhaar Card"], competitionLevel: "Low", providerType: "Government",
  },
  {
    id: "7", name: "Tata Trust Education Scholarship", provider: "Tata Trusts", amount: 150000,
    deadline: "2026-09-01", description: "Comprehensive support for meritorious students from disadvantaged backgrounds.",
    eligibility: { maxIncome: 500000, minPercentage: 85, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: ["Engineering","Medicine","Science","Law"], states: [] },
    applicationUrl: "https://www.tatatrusts.org/our-work/individual-grants-programme", requiredDocuments: ["Income Certificate","Marksheets","Statement of Purpose","Recommendation Letter","ID Proof"], competitionLevel: "High", providerType: "CSR",
  },
  {
    id: "8", name: "State Topper Award", provider: "State Education Board", amount: 60000,
    deadline: "2026-03-31", description: "Reward for students who score in the top 5% of state board examinations.",
    eligibility: { maxIncome: 1200000, minPercentage: 95, categories: ["General","OBC","SC","ST"], educationLevels: ["High School","Undergraduate"], fieldsOfStudy: [], states: ["Maharashtra","Tamil Nadu","Karnataka","Delhi","Kerala"] },
    applicationUrl: "https://scholarships.gov.in/", requiredDocuments: ["Board Marksheet","Domicile Certificate","Aadhaar Card"], competitionLevel: "High", providerType: "Government",
  },
  {
    id: "9", name: "Minority Community Scholarship", provider: "Ministry of Minority Affairs", amount: 45000,
    deadline: "2026-06-15", description: "Support for students belonging to notified minority communities.",
    eligibility: { maxIncome: 350000, minPercentage: 50, categories: ["General","OBC"], educationLevels: ["High School","Undergraduate","Postgraduate"], fieldsOfStudy: [], states: [] },
    applicationUrl: "https://www.minorityaffairs.gov.in/scholarship", requiredDocuments: ["Minority Certificate","Income Certificate","Marksheets","Aadhaar Card"], competitionLevel: "Low", providerType: "Government",
  },
  {
    id: "10", name: "Digital India Tech Scholarship", provider: "MeitY", amount: 120000,
    deadline: "2026-07-15", description: "Encouraging students in technology and computer science.",
    eligibility: { maxIncome: 700000, minPercentage: 70, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: ["Engineering","Technology","Computer Science"], states: [] },
    applicationUrl: "https://www.meity.gov.in/", requiredDocuments: ["Marksheets","Admission Letter","Income Certificate","ID Proof"], competitionLevel: "Medium", providerType: "Government",
  },
  {
    id: "11", name: "Arts & Humanities Fellowship", provider: "Ministry of Culture", amount: 55000,
    deadline: "2026-08-30", description: "Supporting students pursuing arts, humanities, and cultural studies.",
    eligibility: { maxIncome: 600000, minPercentage: 65, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: ["Arts","Humanities","Literature","History"], states: [] },
    applicationUrl: "https://indiaculture.gov.in/scholarships-and-fellowships", requiredDocuments: ["Portfolio","Marksheets","Income Certificate","Recommendation Letter"], competitionLevel: "Low", providerType: "Government",
  },
  {
    id: "12", name: "First-Generation Learner Grant", provider: "NGO Education Alliance", amount: 30000,
    deadline: "2026-04-15", description: "Helping first-generation college-goers from low-income families.",
    eligibility: { maxIncome: 250000, minPercentage: 45, categories: ["General","OBC","SC","ST"], educationLevels: ["High School","Undergraduate"], fieldsOfStudy: [], states: [] },
    applicationUrl: "https://www.buddy4study.com/scholarships", requiredDocuments: ["Parents' Education Affidavit","Income Certificate","Marksheets","Aadhaar Card"], competitionLevel: "Low", providerType: "NGO",
  },
  {
    id: "13", name: "Infosys Foundation Scholarship", provider: "Infosys Foundation", amount: 180000,
    deadline: "2026-08-01", description: "For outstanding engineering and technology students from underprivileged backgrounds.",
    eligibility: { maxIncome: 600000, minPercentage: 80, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate"], fieldsOfStudy: ["Engineering","Technology","Computer Science"], states: [] },
    applicationUrl: "https://www.infosys.com/infosys-foundation/", requiredDocuments: ["Marksheets","Income Certificate","Admission Letter","Recommendation Letter"], competitionLevel: "High", providerType: "CSR",
  },
  {
    id: "14", name: "Sitaram Jindal Foundation Scholarship", provider: "Sitaram Jindal Foundation", amount: 25000,
    deadline: "2026-05-01", description: "Scholarship for deserving students in any field of study.",
    eligibility: { maxIncome: 400000, minPercentage: 60, categories: ["General","OBC","SC","ST"], educationLevels: ["High School","Undergraduate","Postgraduate"], fieldsOfStudy: [], states: [] },
    applicationUrl: "https://www.sitaramjindalfoundation.org/scholarship.php", requiredDocuments: ["Income Certificate","Marksheets","Aadhaar Card","Bank Details"], competitionLevel: "Medium", providerType: "CSR",
  },
  {
    id: "15", name: "Central Sector Scheme", provider: "MHRD", amount: 80000,
    deadline: "2026-09-30", description: "For students belonging to families with income less than ₹8L who scored above 80th percentile in board exams.",
    eligibility: { maxIncome: 800000, minPercentage: 80, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: [], states: [] },
    applicationUrl: "https://scholarships.gov.in/", requiredDocuments: ["Board Marksheet","Income Certificate","College Admission Proof","Aadhaar Card"], competitionLevel: "Medium", providerType: "Government",
  },
  {
    id: "16", name: "HDFC Parivartan Scholarship", provider: "HDFC Bank CSR", amount: 75000,
    deadline: "2026-06-01", description: "Supporting underprivileged students in professional courses.",
    eligibility: { maxIncome: 500000, minPercentage: 55, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: ["Engineering","Medicine","Law","Commerce"], states: [] },
    applicationUrl: "https://www.buddy4study.com/page/hdfc-bank-parivartan-alp-scholarship-programme", requiredDocuments: ["Income Certificate","Marksheets","Admission Proof","Fee Receipt","Aadhaar Card"], competitionLevel: "Medium", providerType: "CSR",
  },
  {
    id: "17", name: "INSPIRE Scholarship", provider: "DST", amount: 160000,
    deadline: "2026-07-01", description: "Innovation in Science Pursuit for Inspired Research — for top science students.",
    eligibility: { maxIncome: 1200000, minPercentage: 85, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate"], fieldsOfStudy: ["Science","Mathematics"], states: [] },
    applicationUrl: "https://online-inspire.gov.in/", requiredDocuments: ["Board Marksheet","Admission Letter","Research Interest Statement","ID Proof"], competitionLevel: "High", providerType: "Government",
  },
  {
    id: "18", name: "Kotak Kanya Scholarship", provider: "Kotak Mahindra Group", amount: 150000,
    deadline: "2026-06-30", description: "For meritorious girl students from underprivileged backgrounds pursuing professional courses.",
    eligibility: { maxIncome: 400000, minPercentage: 75, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate"], fieldsOfStudy: ["Engineering","Medicine","Science","Law"], genders: ["Female"], states: [] },
    applicationUrl: "https://www.buddy4study.com/page/kotak-kanya-scholarship", requiredDocuments: ["Income Certificate","Marksheets","Admission Proof","Aadhaar Card","Bank Details"], competitionLevel: "Medium", providerType: "CSR",
  },
  {
    id: "19", name: "North East Special Scholarship", provider: "DoNER Ministry", amount: 65000,
    deadline: "2026-05-31", description: "Special scholarship for students from North Eastern states.",
    eligibility: { maxIncome: 600000, minPercentage: 60, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: [], states: ["Arunachal Pradesh","Assam","Manipur","Meghalaya","Mizoram","Nagaland","Sikkim","Tripura"] },
    applicationUrl: "https://scholarships.gov.in/", requiredDocuments: ["Domicile Certificate","Marksheets","Income Certificate","Aadhaar Card"], competitionLevel: "Low", providerType: "Government",
  },
  {
    id: "20", name: "Reliance Foundation Scholarship", provider: "Reliance Foundation", amount: 200000,
    deadline: "2026-08-15", description: "For students pursuing undergraduate studies in STEM and liberal arts.",
    eligibility: { maxIncome: 800000, minPercentage: 75, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate"], fieldsOfStudy: ["Engineering","Science","Technology","Arts","Humanities"], states: [] },
    applicationUrl: "https://www.reliancefoundation.org/scholarships", requiredDocuments: ["Marksheets","Income Certificate","Admission Proof","Essay","Recommendation Letter"], competitionLevel: "High", providerType: "CSR",
  },
  {
    id: "21", name: "Pragati Scholarship for Girls", provider: "AICTE", amount: 50000,
    deadline: "2026-06-15", description: "Encouraging girl students to pursue technical education.",
    eligibility: { maxIncome: 800000, minPercentage: 60, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate"], fieldsOfStudy: ["Engineering","Technology"], genders: ["Female"], states: [] },
    applicationUrl: "https://www.aicte-india.org/bureaus/scholarship", requiredDocuments: ["Marksheets","Income Certificate","Admission Proof","Aadhaar Card"], competitionLevel: "Low", providerType: "Government",
  },
  {
    id: "22", name: "Vidyasaarathi Scholarship", provider: "NSDL e-Governance", amount: 40000,
    deadline: "2026-07-31", description: "Platform connecting students with scholarship providers across India.",
    eligibility: { maxIncome: 500000, minPercentage: 60, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: ["Engineering","Commerce","Science","Medicine"], states: [] },
    applicationUrl: "https://www.vidyasaarathi.co.in/", requiredDocuments: ["Marksheets","Income Certificate","Aadhaar Card","Bank Details"], competitionLevel: "Medium", providerType: "Private",
  },
  {
    id: "23", name: "Agri-Innovation Fellowship", provider: "ICAR", amount: 90000,
    deadline: "2026-09-15", description: "For students in agricultural sciences and rural innovation.",
    eligibility: { maxIncome: 700000, minPercentage: 65, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate","Doctorate"], fieldsOfStudy: ["Agriculture","Science"], states: [] },
    applicationUrl: "https://icar.org.in/scholarships", requiredDocuments: ["Marksheets","Admission Proof","Research Proposal","Income Certificate"], competitionLevel: "Medium", providerType: "Government",
  },
  {
    id: "24", name: "Legal Aid Scholarship", provider: "Bar Council of India", amount: 55000,
    deadline: "2026-06-30", description: "For students pursuing law from recognized universities.",
    eligibility: { maxIncome: 600000, minPercentage: 60, categories: ["General","OBC","SC","ST"], educationLevels: ["Undergraduate","Postgraduate"], fieldsOfStudy: ["Law"], states: [] },
    applicationUrl: "https://www.barcouncilofindia.org/", requiredDocuments: ["Law Admission Proof","Marksheets","Income Certificate","Aadhaar Card"], competitionLevel: "Low", providerType: "Government",
  },
];

export const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal",
];

export const fieldsOfStudy = [
  "Engineering","Medicine","Science","Technology","Computer Science",
  "Commerce","Arts","Humanities","Law","Mathematics","Literature",
  "History","Education","Agriculture",
];
