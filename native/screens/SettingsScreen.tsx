import React from "react";

import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import TextInputController from "../components/TextInputController";

import { ScrollView, StyleSheet } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { DevInfo } from "../components/DevInfo";
import { PrivacyPolicy } from "../components/PrivacyPolicy";
import { Typography } from "../components/Typography";
import { supabase, useSession } from "../db";
import { HomeStackParamList } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

type SettingsScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "SettingsScreen"
>;

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const queryClient = useQueryClient();
  const styles = useStyles();
  const { session } = useSession();
  // const { data: user, isLoading } = useGetUser();

  // const updateUser = useUpdateUser();
  const { control } = useForm();

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <ScrollView>
        <Typography variant="xlBold" color="lightGrey" style={styles.mb}>
          Ustawienia
        </Typography>
        <Typography variant="lBold" color="lightGrey" style={styles.mb}>
          Twój email:
        </Typography>
        <TextInputController
          control={control}
          name="email"
          textInputProps={{
            placeholder: session?.user?.email,
            disabled: true,
            editable: false,
            containerStyle: [styles.mb, styles.selfCenter],
          }}
        />

        {/* <TextInputController
          control={control}
          name="username"
          defaultValue={user?.username}
          textInputProps={{
            placeholder: user?.username,
            containerStyle: styles.mt,
            defaultValue: user?.username,
          }}
        />
        <TextInputController
          control={control}
          name="companyName"
          defaultValue={user?.company_name}
          textInputProps={{
            placeholder: user?.company_name,
            containerStyle: styles.mt,
            defaultValue: user?.company_name,
          }}
        />
        <Button
          // onPress={() =>
          //   updateUser.mutate({
          //     username: user?.username,
          //     companyName: user?.company_name,
          //   })
          // }

          type="primary"
          size="s"
          fullWidth
          // until we figure out what to do here
          disabled={true}
          containerStyle={styles.mt}
        >
          {isLoading ? <LoadingSpinner /> : "Aktualizuj"}
        </Button> */}
        <Button
          onPress={async () => {
            await supabase.auth.signOut();
            queryClient.clear();
            // @ts-ignore
            navigation.navigate("StartScreen");
          }}
          type="primary"
          size="xl"
          fullWidth
          containerStyle={[styles.mt2, styles.selfCenter]}
        >
          Wyloguj się
        </Button>
        <PrivacyPolicy />
      </ScrollView>
      <DevInfo />
    </SafeAreaView>
  );
}
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
      paddingHorizontal: theme.spacing * 2,
      paddingTop: theme.spacing * 2,
      alignItems: "center",
      height: "100%",
    },
    mt2: {
      marginTop: theme.spacing * 9,
    },
    selfCenter: {
      alignSelf: "center",
    },
    mb: { marginBottom: 16 },
  })
);
