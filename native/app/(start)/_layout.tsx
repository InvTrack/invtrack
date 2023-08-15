import { useTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { ArrowRightIcon } from "../../components/Icon";

const StartLayout = () => {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: "",
      }}
    >
      <Stack.Screen
        name="start"
        options={{
          headerShown: false,
          headerBackTitleVisible: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerBackTitleVisible: false,
          headerBackVisible: false,
          headerLeft: () => <ArrowRightIcon size={32} onPress={router.back} />,
          headerStyle: {
            backgroundColor: theme.colors.lightBlue,
          },
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerBackTitleVisible: false,
          headerBackVisible: false,
          headerLeft: () => <ArrowRightIcon size={32} onPress={router.back} />,
          headerStyle: {
            backgroundColor: theme.colors.lightBlue,
          },
        }}
      />
    </Stack>
  );
};

export default StartLayout;
