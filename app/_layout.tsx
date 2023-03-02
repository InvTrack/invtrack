import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useColorScheme, View } from "react-native";
import { SessionContext, useSession } from "../db";
import { QueryClient, QueryClientProvider } from "react-query";
import { AccountDetails } from "../components/AccountDetails";
import { LoginPage } from "../components/LoginPage";
import { SplashScreen, Stack } from "expo-router";
import { mainTheme } from "../theme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

const queryClient = new QueryClient();
export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    latoBold: require("../assets/fonts/Lato-Bold.ttf"),
    latoRegular: require("../assets/fonts/Lato-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);

  const { session, loggedIn } = useSession();

  /* Keep the splash screen open until the assets have loaded. In the future, we should just support async font loading with a native version of font-display. */
  if (!fontsLoaded) return <SplashScreen />;
  if (!loggedIn) return <LoginPage />;
  return (
    <SessionContext.Provider value={{ session, loggedIn }}>
      <QueryClientProvider client={queryClient}>
        <View>
          <AccountDetails key={session.user.id} />
        </View>
      </QueryClientProvider>
    </SessionContext.Provider>
  );
}

export function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <>
      <ThemeProvider value={colorScheme === "dark" ? mainTheme : mainTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </>
  );
}
