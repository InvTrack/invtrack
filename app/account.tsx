import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { View } from "react-native";
import { Button } from "react-native-elements";
import { SessionContext, supabase } from "../db";
// import { GoogleSpreadsheet } from 'google-spreadsheet';

export default function AccountDetails() {
  const router = useRouter();
  const { googleAccessToken } = useContext(SessionContext);

  return (
    <View>
      <Button
        title="Google sheets"
        onPress={async () => {
          console.log(googleAccessToken);
        }}
      />
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
