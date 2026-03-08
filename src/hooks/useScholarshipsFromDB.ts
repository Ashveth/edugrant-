import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scholarship } from "@/types/scholarship";

export function useScholarshipsFromDB() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Get count
      const { count } = await supabase
        .from("scholarships")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      setTotalCount(count || 0);

      // Fetch all active scholarships (paginate if >1000)
      const allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("scholarships")
          .select("*")
          .eq("is_active", true)
          .range(from, from + pageSize - 1)
          .order("deadline", { ascending: true });

        if (error || !data || data.length === 0) {
          hasMore = false;
        } else {
          allData.push(...data);
          from += pageSize;
          if (data.length < pageSize) hasMore = false;
        }
      }

      const mapped: Scholarship[] = allData.map((s) => ({
        id: s.id,
        name: s.name,
        provider: s.provider,
        amount: s.amount,
        deadline: s.deadline,
        description: s.description,
        eligibility: {
          maxIncome: s.max_income ?? undefined,
          minPercentage: s.min_percentage ?? undefined,
          categories: s.categories ?? [],
          educationLevels: s.education_levels ?? [],
          fieldsOfStudy: s.fields_of_study ?? [],
          states: s.states ?? [],
          genders: s.genders ?? [],
        },
        applicationUrl: s.application_url || "",
        requiredDocuments: s.required_documents ?? [],
        competitionLevel: s.competition_level as Scholarship["competitionLevel"],
        providerType: s.provider_type as Scholarship["providerType"],
        country: s.country || "India",
        fundingType: s.funding_type || "Partial",
        university: s.university || "",
        eligibilityCriteria: s.eligibility_criteria || "",
        applicationProcess: s.application_process || "",
        tags: s.tags ?? [],
      }));

      setScholarships(mapped);
      setLoading(false);
    };

    load();
  }, []);

  return { scholarships, loading, totalCount };
}
