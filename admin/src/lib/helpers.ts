import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultErr = PostgrestError;

export const convertRemToPixels = (rem: number) =>
  rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
export const getMaxColumns = (width: number, columnWidth: number) => {
  return Math.floor(width / columnWidth);
};
export const getPaginationRange = (page: number, width: number): [number, number] => [
  page * getMaxColumns(window.innerWidth, convertRemToPixels(width)),
  (page + 1) * getMaxColumns(window.innerWidth, convertRemToPixels(width)),
];
