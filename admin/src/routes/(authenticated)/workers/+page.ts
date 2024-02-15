import { error } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data, error: companyIdError } = await supabase
    .from("current_company_id")
    .select()
    .single();
  if (companyIdError || data.id === null) {
    throw error(404, "Failed to fetch company_id");
  }

  const company_id = data.id;
  const { data: workers, error: workersError } = await supabase
    .from("worker")
    .select()
    .eq("company_id", company_id);
  if (workersError) {
    throw error(404, "Failed to fetch workers");
  }

  return {
    company_id,
    workers,
  };
};
