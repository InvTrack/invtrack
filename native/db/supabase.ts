// organize-imports-ignore
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { Database } from "./types/generated";

if (Platform.OS !== "web") {
  require("react-native-url-polyfill/auto");
}

// import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
// router
// const localUrl = "http://192.168.0.102:54321";
const localUrl = "http://192.168.88.251:54321";
// const localUrl = "http://192.168.10.14:54321";
const localAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
// const supabaseUrl = SUPABASE_URL;
// const supabaseAnonKey = SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(localUrl, localAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
