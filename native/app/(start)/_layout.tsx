import { Stack } from "expo-router";
import React from "react";
import { Header } from "../../components/Header";

const StartLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: Header,
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
      <Stack.Screen name="login" />
    </Stack>
  );
};

export default StartLayout;
