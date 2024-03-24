// organize-imports-ignore
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { EnvConfig } from "../config/env";
import { PatchedDatabase } from "./types";
if (Platform.OS !== "web") {
  require("react-native-url-polyfill/auto");
}

const supabaseUrl = EnvConfig.supabaseUrl;
const supabaseAnonKey = EnvConfig.supabaseAnonKey;

export const supabase = createClient<PatchedDatabase>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
