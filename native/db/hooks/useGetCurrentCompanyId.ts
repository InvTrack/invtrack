import { useContext } from "react";
import { useQuery } from "react-query";

import { SessionContext } from "../auth";
import { supabase } from "../supabase";
import { CurrentCompanyIdTable } from "../types";

const getCurrentCompanyId = () =>
  supabase
    .from<"current_company_id", CurrentCompanyIdTable>("current_company_id")
    .select()
    .single();

export const useGetCurrentCompanyId = () => {
  const { session } = useContext(SessionContext);
  return useQuery(["current_company_id", session?.user.id], async () => {
    const { data, error } = await getCurrentCompanyId();
    if (error) throw new Error(error.message);
    return data;
  });
};
