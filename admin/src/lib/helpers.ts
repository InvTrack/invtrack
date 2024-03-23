import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type DeepNonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]> extends object 
  ? DeepNonNullableFields<NonNullable<T[P]>> 
  : NonNullable<T[P]>;
};

// Patch the database to make the View fields non-nullable
// Kind of hacky, and a more accurate patch would be to target only the specific views "existing_products" and "deleted_products" 
export type PatchedDatabase = {
  [K in keyof Database]: K extends 'public' // Targeting the 'public' property
      ? { 
          [P in keyof Database[K]]: P extends 'Views' // Targeting the 'Views' within 'public'
              ? { [V in keyof Database[K][P]]: DeepNonNullableFields<Database[K][P][V]> }
              : Database[K][P]
        }
      : Database[K];
};


export type Tables<T extends keyof PatchedDatabase["public"]["Tables"]> =
  PatchedDatabase["public"]["Tables"][T]["Row"];
export type Views<T extends keyof PatchedDatabase["public"]["Views"]> =
  PatchedDatabase["public"]["Views"][T]["Row"];
export type Enums<T extends keyof PatchedDatabase["public"]["Enums"]> = PatchedDatabase["public"]["Enums"][T];

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultErr = PostgrestError;

export type CurrentCompanyId = CurrentCompanyIdTable["Row"];
export type CurrentCompanyIdTable = PatchedDatabase["public"]["Views"]["current_company_id"];

export type LowQuantityProductRecords = LowQuantityProductRecordsView["Row"];
export type LowQuantityProductRecordsView =
  PatchedDatabase["public"]["Views"]["low_quantity_product_records_view"];

export const convertRemToPixels = (rem: number) =>
  rem * parseFloat(getComputedStyle(document.documentElement).fontSize);

export const getMaxColumns = (width: number, columnWidth: number) => {
  return Math.floor(width / columnWidth);
};

export const getPaginationRange = (page: number, width: number): [number, number] => [
  page * getMaxColumns(window.innerWidth, convertRemToPixels(width)),
  (page + 1) * getMaxColumns(window.innerWidth, convertRemToPixels(width)) - 1,
];

type Parent = {supabase: SupabaseClient<PatchedDatabase>}
export type LoadFunctionArgument = {parent: () => Promise<Parent>}
export type LoadFunctionWithIdArgument = LoadFunctionArgument & {params: {id: number}}