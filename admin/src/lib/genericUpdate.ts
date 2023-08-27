import { goto } from "$app/navigation";
import type { PostgrestBuilder } from "@supabase/postgrest-js";


export const genericUpdate = async <T>(builder: PostgrestBuilder<T>, onSuccess: string, setLoading?: (x: boolean) => void) => {
    try {
    //   loading = true;
      setLoading && setLoading(true);
      let { error } = await builder;
      if (error) throw error;
      goto(onSuccess)
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setLoading && setLoading(false);
    //   loading = false;
    }
  }