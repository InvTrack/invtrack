import { supabase } from "../supabase";

export const useGoogle = () => {
  const singIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    // console.log("GOOGLE SIGNIN", data, error);
  };
  return singIn;
};
