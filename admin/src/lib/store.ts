import { writable } from 'svelte/store';

export const googleAccessToken = writable<string | null>(null)