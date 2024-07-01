import * as Application from "expo-application";
import { channel } from "expo-updates";

// has to be a .js file
// eas.json provides process.env variables, the config here makes sure that during an expo-update,
// the end user receives the correct key/url
// https://docs.expo.dev/build-reference/variables/

const runtimeVersion = "1.5.2";

const isDevEnv =
  (process.env?.EXPO_ENV || process.env.NODE_ENV) === "development";

const appVersion = isDevEnv ? "expo-go" : Application?.nativeApplicationVersion;

const devInfoString =
  (process.env?.SUPABASE_URL?.split(".")[0]?.slice(8) ?? "") +
  "-" +
  (process.env.EXPO_ENV || process.env.NODE_ENV) +
  "@" +
  appVersion +
  `(${runtimeVersion})`;

export let EnvConfig = {
  isDevEnv,
  env: process.env?.EXPO_ENV || process.env.NODE_ENV,
  supabaseUrl: "http://172.20.10.3:54321",
  supabaseAnonKey:
    process.env?.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  appVersion,
  devInfoString,
};

if (channel === "production") {
  EnvConfig.supabaseUrl =
    process.env?.SUPABASE_URL || "https://krureybgsibclbmlcyff.supabase.co";
  EnvConfig.supabaseAnonKey =
    process.env?.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXJleWJnc2liY2xibWxjeWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODUyNzE1NzIsImV4cCI6MjAwMDg0NzU3Mn0.PZ5et3XYm7_9bzUqhdxyMklrh1AFcNm3kT_3Vy-qz6w";
} else if (channel === "staging") {
  EnvConfig.supabaseUrl =
    process.env?.SUPABASE_URL || "https://vskfnihejgggjibolhzv.supabase.co";
  EnvConfig.supabaseAnonKey =
    process.env?.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZza2ZuaWhlamdnZ2ppYm9saHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODUyMjM4ODksImV4cCI6MjAwMDc5OTg4OX0.MucBZoohSbpCJVIBFXE_qUbUu3fIuvqoljY0oXNwR68";
}
