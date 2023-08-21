import React from "react";

import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import TextInputController from "../components/TextInputController";

import { ScrollView, StyleSheet } from "react-native";

import { Typography } from "../components/Typography";
import { supabase } from "../db";
import { useSession } from "../db/hooks/sessionContext";
import { createStyles } from "../theme/useStyles";

export default function AccountDetails() {
  const styles = useStyles();
  const { session } = useSession();
  // const { data: user, isLoading } = useGetUser();

  // const updateUser = useUpdateUser();
  const router = useRouter();
  const { control } = useForm();

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <ScrollView>
        <Typography variant="xlBold" color="darkBlue" style={styles.mb}>
          Ustawienia
        </Typography>
        <Typography variant="lBold" color="darkBlue" style={styles.mb}>
          Twój email:
        </Typography>
        <TextInputController
          control={control}
          name="email"
          textInputProps={{
            placeholder: session?.user?.email,
            disabled: true,
            editable: false,
            containerStyle: styles.mb,
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
            router.push("/(start)/start");
          }}
          type="secondary"
          size="s"
          fullWidth
          containerStyle={styles.mt2}
        >
          Wyloguj się
        </Button>
      </ScrollView>
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
    mt2: {
      marginTop: theme.spacing * 9,
    },
    mb: { marginBottom: 16 },
  })
);
