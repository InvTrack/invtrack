import { useQuery } from "@tanstack/react-query";
import * as Application from "expo-application";
import { EnvConfig } from "../../config/env";
import { supabase } from "../supabase";

const checkIfNativeUpdateNeeded = async (): Promise<boolean> => {
  if (EnvConfig.isDevEnv) {
    return false;
  }

  const res = await supabase.functions.invoke("utilities", {
    body: JSON.stringify({ function: "getAppVersion" }),
  });

  if (res.error) {
    console.error(res.error);
    return false;
  }

  return (
    !Application?.nativeApplicationVersion?.startsWith(res.data as string) ||
    false
  );
};

export const useCheckIfNativeUpdateNeeded = () =>
  useQuery(["checkIfNativeUpdateNeeded"], () => checkIfNativeUpdateNeeded(), {
    refetchInterval: 1000 * 60 * 60,
  });
