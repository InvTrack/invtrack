import { useURL } from "expo-linking";
import { supabase } from "../supabase";

export const useGetTokens = () => {
  const urlStringOriginal = useURL();
  if (urlStringOriginal?.includes("#access_token")) {
    const urlString = urlStringOriginal.replace(
      "#access_token",
      "?access_token"
    );
    const url = new URL(urlString);
    const refreshToken = url.searchParams.get("refresh_token");
    const accessToken = url.searchParams.get("access_token");
    const providerToken = url.searchParams.get("provider_token");
    console.log({
      urlStringOriginal,
      providerToken,
      accessToken,
      refreshToken,
    });
    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({
          refresh_token: refreshToken,
          access_token: accessToken,
        })
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => console.log({ err }));
    }
  }
};
