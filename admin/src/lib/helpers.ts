import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Patch the database to remove excessive nullability from "existing_products" and "deleted_products"
export type PatchedDatabase = {
  [A in keyof Database]: A extends "public"
    ? {
        [B in keyof Database[A]]: B extends "Views"
          ? {
              [C in keyof Database[A][B]]: C extends "existing_products" | "deleted_products"
                ? Database["public"]["Tables"]["product"]
                : Database[A][B][C];
            }
          : Database[A][B];
      }
    : Database[A];
};

export type Tables<T extends keyof PatchedDatabase["public"]["Tables"]> =
  PatchedDatabase["public"]["Tables"][T]["Row"];
export type Views<T extends keyof PatchedDatabase["public"]["Views"]> =
  PatchedDatabase["public"]["Views"][T]["Row"];
export type Enums<T extends keyof PatchedDatabase["public"]["Enums"]> =
  PatchedDatabase["public"]["Enums"][T];

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
