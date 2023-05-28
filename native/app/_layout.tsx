import { SessionContext, useSession, useGetTokens } from "../db";
import { mainTheme } from "../theme";
import { useAppState } from "../utils/useAppState";
import { useOnlineManager } from "../utils/useOnlineManager";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, focusManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import {
  SplashScreen,
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { maybeCompleteAuthSession } from "expo-web-browser";
import React, { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from "expo-router";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      cacheTime: Infinity,
      retry: 0,
    },
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      cacheTime: 1000 * 10,
      // staleTime: Infinity,
    },
  },
});

maybeCompleteAuthSession();
const asyncPersist = createAsyncStoragePersister({
  storage: AsyncStorage,
  // dehydrateOptions: {
  //   dehydrateMutations: true,
  //   dehydrateQueries: false,
  // },
  throttleTime: 1000,
});

const onAppStateChange = (status) => {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
};

export default function App() {
  useAppState(onAppStateChange);
  useOnlineManager();
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
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          maxAge: Infinity,
          persister: asyncPersist,
        }}
        onSuccess={() =>
          queryClient
            .resumePausedMutations()
            .then(() => queryClient.invalidateQueries())
        }
      >
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
      </PersistQueryClientProvider>
    </SessionContext.Provider>
  );
}
