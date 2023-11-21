import { goto } from "$app/navigation";
import type { PostgrestError, PostgrestBuilder } from "@supabase/postgrest-js";

export const genericUpdate = async <T>(
  builder: PostgrestBuilder<T>,
  onSuccess?: string,
  setLoading?: (x: boolean) => void
) => {
  try {
    //   loading = true;
    setLoading && setLoading(true);
    let { error } = await builder;
    if (error) throw error;
    if (onSuccess) goto(onSuccess);
  } catch (error) {
    if (error) alert((error as PostgrestError).message);
  } finally {
    setLoading && setLoading(false);
  }
};
