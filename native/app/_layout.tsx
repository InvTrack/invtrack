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
import { SessionContext, useSession } from "../db";
import { mainTheme } from "../theme";
import { useAppState } from "../utils/useAppState";
import { useOnlineManager } from "../utils/useOnlineManager";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheet, BottomSheetProvider } from "../components/BottomSheet";
import { ArrowRightIcon } from "../components/Icon";
import { Header } from "../components/Header";
import * as ScreenOrientation from "expo-screen-orientation";

ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
SplashScreen.preventAutoHideAsync();

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
      staleTime: Infinity,
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

  const inStartGroup = segments[0] === "(start)";

  const loggedIn = sessionState.loggedIn;

  React.useEffect(() => {
    if (!navigationState?.key) {
      // Temporary fix for router not being ready.
      return;
    }

    if (loggedIn && inStartGroup) {
      router.replace("/(tabs)/list/");
    }

    if (!loggedIn && !inStartGroup) {
      router.replace("/(start)/start");
    }
  }, [navigationState?.key, loggedIn, inStartGroup]);

  React.useEffect(() => {
    StatusBar.setBarStyle("dark-content", true);
  }, []);

  if (!fontsLoaded || sessionState.loading) {
    SplashScreen.preventAutoHideAsync();
    return;
  } else {
    SplashScreen.hideAsync();
  }

  return (
    <ProvideProviders>
      <Stack
        screenOptions={{
          header: (p) => <Header {...p} />,
        }}
      >
        <Stack.Screen
          name="(start)"
          options={{
            headerShown: false,
          }}
        />
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
        <Stack.Screen name="account" />
        <Stack.Screen
          name="new"
          options={{
            headerLeft: () => (
              <ArrowRightIcon size={32} onPress={router.back} />
            ),
          }}
        />
      </Stack>
      <BottomSheet />
    </ProvideProviders>
  );
}
