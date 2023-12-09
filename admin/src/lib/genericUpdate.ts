import { goto } from "$app/navigation";
import type { PostgrestError, PostgrestBuilder } from "@supabase/postgrest-js";

type GenericUpdateOptions = {
  /**
   * goto route
   */
  onSuccess?: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: PostgrestError) => void;
};

export const genericUpdate = async <T>(
  builder: PostgrestBuilder<T>,
  options?: GenericUpdateOptions
) => {
  const { onSuccess, setLoading, onError } = options || {};
  try {
    //   loading = true;
    setLoading && setLoading(true);
    let { error } = await builder;
    if (error) {
      onError && onError(error);
    }
    if (onSuccess) goto(onSuccess);
  } catch (error) {
    if (error && !onError) alert((error as PostgrestError).message);
  } finally {
    setLoading && setLoading(false);
  }
};
