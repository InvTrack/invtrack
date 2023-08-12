import { createClient } from "@supabase/supabase-js";

// import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

const localUrl = "http://localhost:54321";
const localAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
// const supabaseUrl = SUPABASE_URL;
// const supabaseAnonKey = SUPABASE_ANON_KEY;

export const supabase = createClient(localUrl, localAnonKey, {
  auth: {
    // storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
