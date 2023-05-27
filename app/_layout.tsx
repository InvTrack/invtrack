import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useColorScheme } from "react-native";
import { SessionContext, useGetTokens, useSession } from "../db";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  SplashScreen,
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { mainTheme } from "../theme";
import { maybeCompleteAuthSession } from "expo-web-browser";

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from "expo-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});
maybeCompleteAuthSession();
export default function App() {
  const [fontsLoaded, fontsError] = useFonts({
    latoBold: require("../assets/fonts/Lato-Bold.ttf"),
    latoRegular: require("../assets/fonts/Lato-Regular.ttf"),
    ...FontAwesome.font,
  });
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);
  useGetTokens();

  const sessionState = useSession();
  const colorScheme = useColorScheme();

  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  React.useEffect(() => {
    // console.log("nav", navigationState);
    if (!navigationState?.key) {
      // Temporary fix for router not being ready.
      return;
    }

    const onLoginPage = segments[0] === "(start)";
    const loggedIn = sessionState.loggedIn;

    if (!loggedIn && !onLoginPage) {
      router.replace("(start)/start");
    }

    if (loggedIn && onLoginPage) {
      router.replace("/inventory");
    }
  }, [
    sessionState.loading,
    sessionState.loggedIn,
    segments[0],
    navigationState?.key,
  ]);

  if (!fontsLoaded || sessionState.loading) {
    return <SplashScreen />;
  }
  // this shouldnt be in the _layout file
  return (
    <SessionContext.Provider value={sessionState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === "dark" ? mainTheme : mainTheme}>
          <Stack>
            <Stack.Screen
              name="inventory/index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="account" options={{ title: "Dane konta" }} />
            <Stack.Screen name="new" />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionContext.Provider>
  );
}
