import type { PostgrestBuilder } from "@supabase/postgrest-js";

export const genericGet = async <T>(
  builder: PostgrestBuilder<T>,
  setter: (entity: T, countEntity: Awaited<PostgrestBuilder<T>>["count"]) => void
) => {
  try {
    //   loading = true;
    const { data, error, status, count } = await builder;
    if (error && status !== 406) throw error;
    if (data) setter(data, count);
  } catch (error) {
    if (error instanceof Error) alert(error.message);
  } finally {
    //   loading = false;
  }
};
