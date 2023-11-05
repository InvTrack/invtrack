import { writable } from "svelte/store";

export const googleAccessToken = writable<string | null>(null);
export const currentCompanyId = writable<number | null | undefined>(null);
