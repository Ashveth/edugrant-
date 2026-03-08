import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const countries = [
  { name: "United States", flag: "🇺🇸", currency: "$", rate: 83 },
  { name: "United Kingdom", flag: "🇬🇧", currency: "£", rate: 105 },
  { name: "Canada", flag: "🇨🇦", currency: "C$", rate: 62 },
  { name: "Australia", flag: "🇦🇺", currency: "A$", rate: 55 },
  { name: "Germany", flag: "🇩🇪", currency: "€", rate: 91 },
  { name: "Netherlands", flag: "🇳🇱", currency: "€", rate: 91 },
  { name: "Sweden", flag: "🇸🇪", currency: "SEK", rate: 8 },
  { name: "Switzerland", flag: "🇨🇭", currency: "CHF", rate: 95 },
  { name: "Japan", flag: "🇯🇵", currency: "¥", rate: 0.56 },
  { name: "South Korea", flag: "🇰🇷", currency: "₩", rate: 0.063 },
  { name: "China", flag: "🇨🇳", currency: "¥", rate: 11.5 },
  { name: "Singapore", flag: "🇸🇬", currency: "S$", rate: 62 },
  { name: "France", flag: "🇫🇷", currency: "€", rate: 91 },
  { name: "Italy", flag: "🇮🇹", currency: "€", rate: 91 },
  { name: "Norway", flag: "🇳🇴", currency: "NOK", rate: 7.8 },
  { name: "Finland", flag: "🇫🇮", currency: "€", rate: 91 },
  { name: "Denmark", flag: "🇩🇰", currency: "DKK", rate: 12 },
  { name: "Ireland", flag: "🇮🇪", currency: "€", rate: 91 },
  { name: "New Zealand", flag: "🇳🇿", currency: "NZ$", rate: 50 },
  { name: "Spain", flag: "🇸🇪", currency: "€", rate: 91 },
  { name: "India", flag: "🇮🇳", currency: "₹", rate: 1 },
];

const universities: Record<string, string[]> = {
  "United States": ["Harvard University", "MIT", "Stanford University", "Yale University", "Princeton University", "Columbia University", "University of Chicago", "CalTech", "UC Berkeley", "University of Michigan", "Georgia Tech", "NYU", "UCLA", "University of Pennsylvania", "Duke University"],
  "United Kingdom": ["University of Oxford", "University of Cambridge", "Imperial College London", "UCL", "LSE", "University of Edinburgh", "King's College London", "University of Manchester", "University of Bristol", "University of Warwick"],
  "Canada": ["University of Toronto", "McGill University", "UBC", "University of Alberta", "University of Waterloo", "Western University", "Queen's University", "McMaster University", "University of Calgary", "Simon Fraser University"],
  "Australia": ["University of Melbourne", "University of Sydney", "ANU", "University of Queensland", "UNSW", "Monash University", "University of Adelaide", "University of Western Australia", "Macquarie University", "Deakin University"],
  "Germany": ["TU Munich", "LMU Munich", "Heidelberg University", "Humboldt University", "RWTH Aachen", "Free University of Berlin", "University of Freiburg", "University of Göttingen", "TU Berlin", "University of Bonn"],
  "Netherlands": ["University of Amsterdam", "TU Delft", "Utrecht University", "Leiden University", "Erasmus University Rotterdam", "Wageningen University", "VU Amsterdam", "University of Groningen"],
  "Sweden": ["KTH Royal Institute", "Lund University", "Uppsala University", "Stockholm University", "Chalmers University", "Gothenburg University"],
  "Switzerland": ["ETH Zurich", "EPFL", "University of Zurich", "University of Geneva", "University of Basel", "University of Bern"],
  "Japan": ["University of Tokyo", "Kyoto University", "Osaka University", "Tohoku University", "Tokyo Institute of Technology", "Keio University", "Waseda University", "Nagoya University"],
  "South Korea": ["Seoul National University", "KAIST", "Yonsei University", "Korea University", "POSTECH", "Sungkyunkwan University", "Hanyang University"],
  "China": ["Tsinghua University", "Peking University", "Fudan University", "Zhejiang University", "Shanghai Jiao Tong University", "Nanjing University", "USTC", "Wuhan University"],
  "Singapore": ["NUS", "NTU", "Singapore Management University", "SUTD"],
  "France": ["Sorbonne University", "École Polytechnique", "Sciences Po", "HEC Paris", "ENS Paris", "University of Paris-Saclay", "INSEAD"],
  "Italy": ["University of Bologna", "Sapienza University", "Politecnico di Milano", "University of Padua", "University of Milan", "Bocconi University"],
  "Norway": ["University of Oslo", "NTNU", "University of Bergen", "UiT Arctic University"],
  "Finland": ["University of Helsinki", "Aalto University", "University of Turku", "Tampere University"],
  "Denmark": ["University of Copenhagen", "Aarhus University", "DTU", "Aalborg University"],
  "Ireland": ["Trinity College Dublin", "University College Dublin", "NUI Galway", "University of Limerick", "Dublin City University"],
  "New Zealand": ["University of Auckland", "University of Otago", "Victoria University of Wellington", "University of Canterbury"],
  "Spain": ["University of Barcelona", "Autonomous University of Madrid", "University of Salamanca", "Polytechnic University of Madrid", "IE University"],
  "India": ["IIT Bombay", "IIT Delhi", "IIT Madras", "IISc Bangalore", "JNU", "Delhi University", "BHU", "Anna University", "BITS Pilani", "NIT Trichy"],
};

const fields = ["Engineering", "Science", "Medicine", "Business", "Arts", "Law", "Computer Science", "Mathematics", "Economics", "Environmental Science", "Education", "Social Sciences", "Architecture", "Agriculture", "Pharmacy", "Journalism", "Psychology", "Public Health", "Data Science", "Biotechnology"];

const tags: Record<string, string[]> = {
  "Engineering": ["STEM", "Technology", "Innovation"],
  "Science": ["STEM", "Research", "Laboratory"],
  "Medicine": ["Healthcare", "Clinical", "Medical Research"],
  "Business": ["MBA", "Management", "Entrepreneurship"],
  "Arts": ["Humanities", "Creative", "Liberal Arts"],
  "Law": ["Legal Studies", "Justice", "Policy"],
  "Computer Science": ["STEM", "AI", "Software", "Technology"],
  "Mathematics": ["STEM", "Analytics", "Research"],
  "Economics": ["Finance", "Policy", "Development"],
  "Environmental Science": ["Sustainability", "Climate", "Green"],
  "Education": ["Teaching", "Pedagogy", "Development"],
  "Social Sciences": ["Research", "Policy", "Community"],
  "Architecture": ["Design", "Urban Planning", "Creative"],
  "Agriculture": ["Rural Development", "Food Science", "Sustainability"],
  "Pharmacy": ["Healthcare", "Drug Research", "Clinical"],
  "Journalism": ["Media", "Communication", "Writing"],
  "Psychology": ["Mental Health", "Research", "Clinical"],
  "Public Health": ["Healthcare", "Epidemiology", "Community"],
  "Data Science": ["STEM", "AI", "Analytics", "Technology"],
  "Biotechnology": ["STEM", "Research", "Innovation", "Healthcare"],
};

const educationLevels = ["Undergraduate", "Postgraduate", "Doctorate"];

const providerTypes = ["Government", "NGO", "CSR", "Private"];
const competitionLevels = ["Low", "Medium", "High"];
const fundingTypes = ["Fully Funded", "Partial", "Tuition Waiver", "Stipend"];

const govOrgs: Record<string, string[]> = {
  "United States": ["U.S. Department of State", "Fulbright Commission", "NSF", "NIH", "USAID"],
  "United Kingdom": ["British Council", "Chevening Secretariat", "Commonwealth Scholarship Commission", "UKRI"],
  "Canada": ["Global Affairs Canada", "NSERC", "Vanier CGS Program", "IDRC"],
  "Australia": ["Department of Foreign Affairs", "Australian Academy of Science", "CSIRO"],
  "Germany": ["DAAD", "German Academic Foundation", "Heinrich Böll Foundation", "Konrad Adenauer Foundation"],
  "Netherlands": ["Nuffic", "Holland Scholarship Program", "Orange Knowledge Programme"],
  "Sweden": ["Swedish Institute", "SIDA", "Wallenberg Foundation"],
  "Switzerland": ["Swiss Government", "ETH Zurich Foundation", "SNSF"],
  "Japan": ["MEXT", "JASSO", "JSPS", "Japan Foundation"],
  "South Korea": ["KGSP", "Korean Government", "NIIED", "Korea Foundation"],
  "China": ["CSC", "Chinese Government", "Confucius Institute"],
  "Singapore": ["Ministry of Education Singapore", "A*STAR", "Temasek Foundation"],
  "France": ["Campus France", "Eiffel Excellence Program", "French Government"],
  "Italy": ["Italian Government", "MAECI", "University Grants"],
  "Norway": ["Norwegian Government", "Quota Scheme", "Research Council of Norway"],
  "Finland": ["CIMO", "Finnish Government", "Academy of Finland"],
  "Denmark": ["Danish Government", "Danida Fellowship", "Novo Nordisk Foundation"],
  "Ireland": ["Irish Research Council", "Government of Ireland", "Science Foundation Ireland"],
  "New Zealand": ["MFAT New Zealand", "New Zealand Government", "Education New Zealand"],
  "Spain": ["Spanish Government", "AECID", "La Caixa Foundation"],
  "India": ["Ministry of Education", "AICTE", "UGC", "DST", "CSIR", "ICCR"],
};

const privateOrgs = ["Bill & Melinda Gates Foundation", "Aga Khan Foundation", "Rotary Foundation", "Ford Foundation", "Mastercard Foundation", "Open Society Foundations", "World Bank", "ADB", "UNDP", "UNESCO", "Joint Japan World Bank", "Erasmus Mundus", "OPEC Fund"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function generateScholarships(): any[] {
  const rand = seededRandom(42);
  const result: any[] = [];
  let idCounter = 100;

  // Distribution targets: 150 UG, 200 PG, 150 PhD
  const degreeDistribution: string[] = [];
  for (let i = 0; i < 150; i++) degreeDistribution.push("Undergraduate");
  for (let i = 0; i < 200; i++) degreeDistribution.push("Postgraduate");
  for (let i = 0; i < 150; i++) degreeDistribution.push("Doctorate");
  // Shuffle
  degreeDistribution.sort(() => rand() - 0.5);

  for (let i = 0; i < 500; i++) {
    const country = pick(countries, rand);
    const countryUnis = universities[country.name] || ["General University"];
    const uni = pick(countryUnis, rand);
    const field = pick(fields, rand);
    const fieldTags = tags[field] || ["General"];
    const degree = degreeDistribution[i] || pick(educationLevels, rand);
    const funding = pick(fundingTypes, rand);
    const competition = pick(competitionLevels, rand);
    const providerType = pick(providerTypes, rand);

    // Provider name
    let provider: string;
    if (providerType === "Government") {
      const govList = govOrgs[country.name] || ["Government"];
      provider = pick(govList, rand);
    } else if (providerType === "Private" || providerType === "NGO") {
      provider = rand() > 0.4 ? pick(privateOrgs, rand) : uni;
    } else {
      provider = uni;
    }

    // Amount in INR
    let amount: number;
    if (funding === "Fully Funded") {
      amount = Math.round((300000 + rand() * 2700000) / 10000) * 10000;
    } else if (funding === "Tuition Waiver") {
      amount = Math.round((200000 + rand() * 1500000) / 10000) * 10000;
    } else if (funding === "Stipend") {
      amount = Math.round((50000 + rand() * 400000) / 10000) * 10000;
    } else {
      amount = Math.round((25000 + rand() * 500000) / 10000) * 10000;
    }

    // Deadline: spread across 2026
    const month = Math.floor(rand() * 12) + 1;
    const day = Math.min(28, Math.floor(rand() * 28) + 1);
    const deadline = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Scholarship name generation
    const nameTemplates = [
      `${uni} ${degree} ${field} Scholarship`,
      `${provider} ${field} Excellence Award`,
      `${country.name} ${degree} Fellowship in ${field}`,
      `${uni} International ${degree} Grant`,
      `${provider} ${degree} Merit Scholarship`,
      `${country.name} Global ${field} Scholarship`,
      `${uni} ${funding} ${degree} Award`,
      `${provider} International Students Fund`,
      `${country.name} ${field} Research Grant`,
      `${uni} Dean's ${degree} Scholarship`,
    ];
    const name = pick(nameTemplates, rand);

    const descriptions = [
      `${funding} scholarship for international students pursuing ${degree} studies in ${field} at ${uni}, ${country.name}.`,
      `A prestigious ${competition.toLowerCase()} competition award supporting outstanding ${degree} students in ${field}. Offered by ${provider}.`,
      `${provider} invites applications from talented students for ${degree}-level studies in ${field} at leading institutions in ${country.name}.`,
      `This ${funding.toLowerCase()} opportunity covers ${funding === "Fully Funded" ? "tuition, living expenses, and travel" : "partial tuition fees"} for ${degree} programs in ${field}.`,
    ];

    const eligibilityCriteria = [
      `Open to international students. Minimum GPA: ${(2.5 + rand() * 1.5).toFixed(1)}/4.0 or equivalent.`,
      `Applicants must have completed prior degree with strong academic record. ${degree === "Doctorate" ? "Research proposal required." : ""}`,
      `Available for students from all countries. ${funding === "Fully Funded" ? "Need-based criteria may apply." : "Merit-based selection."}`,
    ];

    const applicationProcesses = [
      "Apply online through the official portal. Submit all required documents before the deadline.",
      "Complete the online application form, upload documents, and submit a personal statement.",
      "Applications accepted through the university portal. Include academic transcripts and recommendation letters.",
    ];

    const requiredDocs = pickN([
      "Academic Transcripts", "CV/Resume", "Statement of Purpose", "Recommendation Letters",
      "English Proficiency Test", "Passport Copy", "Research Proposal", "Financial Statement",
      "Motivation Letter", "Portfolio", "Work Experience Certificate"
    ], 3 + Math.floor(rand() * 3), rand);

    const fieldsOfStudy = rand() > 0.3 ? [field, ...pickN(fields.filter(f => f !== field), Math.floor(rand() * 3), rand)] : [];

    const id = `sch-${idCounter++}`;

    result.push({
      id,
      name,
      provider,
      amount,
      deadline,
      description: pick(descriptions, rand),
      categories: ["General", "OBC", "SC", "ST"],
      education_levels: [degree],
      fields_of_study: fieldsOfStudy,
      states: [],
      genders: rand() > 0.9 ? ["Female"] : [],
      application_url: `https://apply.${uni.toLowerCase().replace(/\s+/g, "")}.edu/scholarships`,
      required_documents: requiredDocs,
      competition_level: competition,
      provider_type: providerType,
      is_active: true,
      accepts_direct_apply: rand() > 0.7,
      country: country.name,
      funding_type: funding,
      university: uni,
      eligibility_criteria: pick(eligibilityCriteria, rand),
      application_process: pick(applicationProcesses, rand),
      tags: [...fieldTags, funding, degree, country.name],
      min_percentage: Math.round(50 + rand() * 30),
      max_income: rand() > 0.5 ? Math.round((300000 + rand() * 1200000) / 100000) * 100000 : null,
    });
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const scholarships = generateScholarships();

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < scholarships.length; i += batchSize) {
      const batch = scholarships.slice(i, i + batchSize);
      const { error } = await supabase
        .from("scholarships")
        .upsert(batch, { onConflict: "id" });

      if (error) {
        errors.push(`Batch ${i / batchSize}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted, total: scholarships.length, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
