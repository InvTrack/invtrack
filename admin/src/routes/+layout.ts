import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { PatchedDatabase } from "$lib/helpers";
import { currentCompanyId } from "$lib/store.js";
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit";

export const load = async ({ fetch, data, depends }) => {
  depends("supabase:auth");

  const supabase = createSupabaseLoadClient<PatchedDatabase>({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: companyIdData } = await supabase.from("current_company_id").select("*").single();
  const company_id = companyIdData?.id;
  currentCompanyId.set(company_id);

  return { supabase, session };
};
