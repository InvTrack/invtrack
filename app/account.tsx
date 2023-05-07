import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Button } from "react-native-elements";
import { supabase } from "../db";

export default function AccountDetails() {
  const router = useRouter();

  return (
    <View>
      <Button
        title="Sign Out"
        onPress={() => {
          supabase.auth.signOut();
          router.push("/login");
        }}
      />
    </View>
  );
}
