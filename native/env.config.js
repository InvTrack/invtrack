import * as Updates from "expo-updates";

// has to be a .js file

// by default expo-updates takes the local .env file and uses it in update
// so let's prevent that
// https://docs.expo.dev/build-reference/variables/

export let EnvConfig = {
  env: process.env?.EXPO_ENV || process.env.NODE_ENV,
  supabaseUrl: process.env?.SUPABASE_URL || "http://172.20.10.14:54321",
  supabaseAnonKey:
    process.env?.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
};

if (Updates.channel === "production") {
  EnvConfig.supabaseUrl =
    process.env?.SUPABASE_URL || "https://krureybgsibclbmlcyff.supabase.co";
  EnvConfig.supabaseAnonKey =
    process.env?.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZza2ZuaWhlamdnZ2ppYm9saHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODUyMjM4ODksImV4cCI6MjAwMDc5OTg4OX0.MucBZoohSbpCJVIBFXE_qUbUu3fIuvqoljY0oXNwR68";
} else if (Updates.channel === "staging") {
  EnvConfig.supabaseUrl =
    process.env?.SUPABASE_URL || "https://vskfnihejgggjibolhzv.supabase.co";
  EnvConfig.supabaseAnonKey =
    process.env?.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXJleWJnc2liY2xibWxjeWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODUyNzE1NzIsImV4cCI6MjAwMDg0NzU3Mn0.PZ5et3XYm7_9bzUqhdxyMklrh1AFcNm3kT_3Vy-qz6w";
}
