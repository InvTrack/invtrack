// RNGH has to be on top
// organize-imports-ignore
import "react-native-gesture-handler";
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
  SplashScreen,
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { HeaderLeft } from "../components/HeaderLeft";
import { HeaderRight } from "../components/HeaderRight";
import { SessionContext, useSession } from "../db";
import { mainTheme } from "../theme";
import { useAppState } from "../utils/useAppState";
import { useOnlineManager } from "../utils/useOnlineManager";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheet, BottomSheetProvider } from "../components/BottomSheet";

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

const ProvideProviders = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const sessionState = useSession();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetProvider>
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
            <ThemeProvider
              value={colorScheme === "dark" ? mainTheme : mainTheme}
            >
              {children}
            </ThemeProvider>
          </PersistQueryClientProvider>
        </SessionContext.Provider>
      </BottomSheetProvider>
    </GestureHandlerRootView>
  );
};

export default function Root() {
  useAppState(onAppStateChange);
  useOnlineManager();
  const [fontsLoaded, fontsError] = useFonts({
    latoBold: require("../assets/fonts/Lato-Bold.ttf"),
    latoRegular: require("../assets/fonts/Lato-Regular.ttf"),
  });
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);

  const sessionState = useSession();

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
    <ProvideProviders>
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
          headerRight: (props) => <HeaderRight {...props} href="/account" />,
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
        <Stack.Screen
          name="account"
          options={{
            headerTitle: "Ustawienia",
          }}
        />
      </Stack>
      <BottomSheet />
    </ProvideProviders>
  );
}
