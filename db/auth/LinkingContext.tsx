import { User } from "@supabase/supabase-js";
import { useNavigation } from "expo-router";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { Linking } from "react-native";
import { supabase } from "../supabase";

export const LinkingContext = ({ children }: { children: ReactNode }) => {
  const [actionRequired, setActionRequired] = useState(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    Linking.addEventListener("url", (event) => {
      let urlString = event.url;
      if (event.url.includes("authRedirectHandler#")) {
        urlString = event.url.replace(
          "authRedirectHandler#",
          "authRedirectHandler?"
        );
      }
      const url = new URL(urlString);

      const refreshToken = url.searchParams.get("refresh_token");
      const accessToken = url.searchParams.get("access_token");

      const type = url.searchParams.get("type");

      //   if (type === AUTH_REDIRECT_TYPES.INVITE) {
      //     console.log("the user verified their email!");
      //   }
      //   if (type === AUTH_REDIRECT_TYPES.RECOVERY) {
      //     console.log("the user needs to reset their password...");
      //     setActionRequired(AUTH_ACTION_TYPES.RECOVER_PASSWORD);
      //     navigation.navigate("ResetPassword");
      //   }
      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({
            refresh_token: refreshToken,
            access_token: accessToken,
          })
          .then((res) => {
            console.log({ res });
            setCurrentUser(res.data.user);
          })
          .catch((err) => console.log({ err }));
      }
    });
    return () => {
      Linking.removeAllListeners("url");
    };
  }, [setCurrentUser, setActionRequired, navigation]);

  return children;
};
