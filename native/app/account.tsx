import React from "react";

import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import TextInputController from "../components/TextInputController";

import { StyleSheet } from "react-native";
import { supabase, useGetUser, useUpdateUser } from "../db";
import { useSession } from "../db/hooks/sessionContext";
import { createStyles } from "../theme/useStyles";

export default function AccountDetails() {
  const styles = useStyles();
  const { session } = useSession();
  const { data: user, isLoading } = useGetUser();

  const updateUser = useUpdateUser();
  const router = useRouter();
  const { control } = useForm();
  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <TextInputController
        control={control}
        name="email"
        textInputProps={{
          placeholder: session?.user?.email,
        }}
      />
      <TextInputController
        control={control}
        name="username"
        textInputProps={{
          placeholder: user?.username,
          containerStyle: styles.mt,
        }}
      />
      <TextInputController
        control={control}
        name="companyName"
        textInputProps={{
          placeholder: user?.company_name,
          containerStyle: styles.mt,
        }}
      />
      <Button
        onPress={() =>
          updateUser.mutate({
            username: user?.username,
            companyName: user?.company_name,
          })
        }
        type="primary"
        size="s"
        fullWidth
        disabled={isLoading}
        containerStyle={styles.mt}
      >
        {isLoading ? "Ładowanie ..." : "Aktualizuj"}
      </Button>
      <Button
        onPress={async () => {
          await supabase.auth.signOut();
          router.push("/(start)/start");
        }}
        type="secondary"
        size="s"
        fullWidth
        containerStyle={styles.mt2}
      >
        Wyloguj się
      </Button>
    </SafeAreaView>
  );
}
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightBlue,
      paddingHorizontal: theme.spacing * 2,
      paddingTop: theme.spacing * 2,
      alignItems: "center",
      height: "100%",
    },
    updateButton: {},
    mt: {
      marginTop: theme.spacing * 2,
    },
    mt2: {
      marginTop: theme.spacing * 9,
    },
  })
);
