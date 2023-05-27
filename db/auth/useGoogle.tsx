import { makeRedirectUri, startAsync } from "expo-auth-session";
import { supabase, supabaseUrl } from "../supabase";

export const useGoogle1 = () => {
  const singIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    // console.log("GOOGLE SIGNIN", data, error);
  };
  return singIn;
};

export const useGoogle2 = () => {
  const singIn = async () => {
    const redirectUrl = makeRedirectUri({
      path: "/auth/callback",
    });
    // const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`;
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google`;

    console.log(authUrl);

    const authResponse = await startAsync({
      authUrl,
      returnUrl: redirectUrl,
    });

    console.log(authResponse);
  };
  return singIn;
};
