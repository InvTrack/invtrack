import { useQuery } from "@tanstack/react-query";
import * as Application from "expo-application";
import { supabase } from "../supabase";

const checkIfNativeUpdateNeeded = async (): Promise<boolean> => {
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
  useQuery(["checkIfNativeUpdateNeeded"], () => checkIfNativeUpdateNeeded());
