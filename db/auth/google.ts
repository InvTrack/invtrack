import * as Google from "expo-auth-session/providers/google";
import { supabase, supabaseUrl } from "../supabase";

export const useGoogleSignIn = () => {
  const [req, _res, promptAsync] = Google.useAuthRequest({
    expoClientId: "",
    iosClientId: "",
    androidClientId: "",
    webClientId:
      "120140327021-6uagv5mgnikrn6nr52evl791iui3r1v2.apps.googleusercontent.com",
  });
  console.log(req);

  const handleGoogleSignIn = () => {
    // Will trigger Google sign-in pop up and redirect
    // the redirect url must be added in supabase setting -> authentication -> Redirect url
    // You can get the url by logging `req.redirectUri`
    promptAsync({
      url: `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${req?.redirectUri}`,
    }).then(async (res) => {
      console.log("res", res);
      // After we got refresh token with the response, we can send it to supabase to sign-in the user
      //   const {
      //     data: { user, session },
      //     error,
      //   } = await supabase.auth.refreshSession({
      //     refresh_token: res.params.refresh_token,
      //   });
      //   console.log({ user, session, error });
    });
  };
  return handleGoogleSignIn;
};
