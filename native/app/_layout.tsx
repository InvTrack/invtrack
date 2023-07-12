import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { focusManager, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import {
  AppStateStatus,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";

import {
  Link,
  SplashScreen,
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { Button } from "../components/Button";
import { HeaderLeft } from "../components/HeaderLeft";
import { Typography } from "../components/Typography";
import { SessionContext, useSession } from "../db";
import { mainTheme } from "../theme";
import { useAppState } from "../utils/useAppState";
import { useOnlineManager } from "../utils/useOnlineManager";

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

const asyncPersist = createAsyncStoragePersister({
  storage: AsyncStorage,
  // dehydrateOptions: {
  //   dehydrateMutations: true,
  //   dehydrateQueries: false,
  // },
  throttleTime: 1000,
});

const onAppStateChange = (status: AppStateStatus) => {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
};

export default function Root() {
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

  const sessionState = useSession();
  const colorScheme = useColorScheme();

  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const onLoginPage = segments[0] === "(start)" && segments[1] === "login";
  const onRegisterPage =
    segments[0] === "(start)" && segments[1] === "register";
  const onStartPage = segments[0] === "(start)" && segments[1] === "start";
  const loggedIn = sessionState.loggedIn;

  //
  React.useEffect(() => {
    if (!navigationState?.key) {
      // Temporary fix for router not being ready.
      return;
    }

    if (loggedIn && (onLoginPage || onStartPage || onRegisterPage)) {
      router.replace("/(tabs)/inventory");
    }

    if (!loggedIn && !onStartPage) {
      router.replace("(start)/start");
    }
  }, [
    sessionState.loading,
    sessionState.loggedIn,
    navigationState?.key,
    loggedIn,
  ]);

  React.useEffect(() => {
    StatusBar.setBarStyle("dark-content", true);
  }, []);

  if (!fontsLoaded || sessionState.loading) {
    return <SplashScreen />;
  }
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
          <Stack
            // theme not available here yet
            screenOptions={{
              headerTitle: "",
              headerBackVisible: false,
              headerStyle: { backgroundColor: "#EDF6FF" },
              headerLeft: (props) => (
                <HeaderLeft
                  {...props}
                  href={loggedIn ? "/(tabs)/inventory" : "(start)/start"}
                />
              ),
              headerRight: () => (
                <Link href={{ pathname: "/account" }} asChild>
                  <Button type="primary" size="xs" onPress={() => {}}>
                    <Typography variant="xs">Ac</Typography>
                  </Button>
                </Link>
              ),
            }}
          >
            <Stack.Screen name="(start)" />
            <Stack.Screen name="(tabs)" />
            {/* TODO styling etc. */}
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                // needs a custom header
                headerShown: false,
              }}
            />
          </Stack>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SessionContext.Provider>
  );
}
