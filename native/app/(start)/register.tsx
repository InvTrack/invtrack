import React from "react";
import { useForm } from "react-hook-form";
import { Keyboard, ScrollView, StyleSheet } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import TextInputController from "../../components/TextInputController";
import { Typography } from "../../components/Typography";
import { supabase } from "../../db";
import { createStyles } from "../../theme/useStyles";
const { Link } = require("expo-router");

type FormValues = {
  name: string;
  surname: string;
  email: string;
  password: string;
  passwordRepeat: string;
};
export default function Register() {
  const styles = useStyles();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      passwordRepeat: "",
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const onSubmit = async ({ email, password }: FormValues) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    error && console.log(error, error.cause, error.status);
  };

  return (
    <SafeAreaView
      edges={["left", "bottom", "right", "top"]}
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={[styles.container, styles.background]}
        style={styles.background}
        keyboardShouldPersistTaps="handled"
      >
        <Typography
          variant="xlBold"
          color="darkBlue"
          underline
          style={styles.title}
        >
          Rejestracja
        </Typography>
        <TextInputController
          name="name"
          control={control}
          textInputProps={{ placeholder: "imię", containerStyle: styles.input }}
        />
        <TextInputController
          name="surname"
          control={control}
          textInputProps={{
            placeholder: "nazwisko",
            containerStyle: styles.input,
          }}
        />
        <TextInputController
          name="email"
          control={control}
          textInputProps={{
            placeholder: "e-mail,",
            containerStyle: styles.input,
          }}
        />
        <TextInputController
          name="password"
          control={control}
          textInputProps={{
            placeholder: "hasło",
            secureTextEntry: true,
            containerStyle: styles.input,
            // a hack to prevent an ios password strength overlay
            blurOnSubmit: false,
            onSubmitEditing: () => Keyboard.dismiss(),
          }}
          rules={{
            minLength: {
              value: 6,
              message: "Hasło musi mieć minimum 6 znaków",
            },
          }}
        />
        <TextInputController
          name="passwordRepeat"
          control={control}
          textInputProps={{
            placeholder: "powtórz hasło",
            secureTextEntry: true,
            containerStyle: styles.input,
          }}
        />
        <Button
          type="primary"
          size="xs"
          shadow
          containerStyle={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          Zarejestruj się
        </Button>
        <Typography style={styles.registerLink}>
          <Typography variant="xs" color="darkBlue" opacity>
            Masz już konto?{" "}
          </Typography>
          <Link href="/login" style={styles.link}>
            Zaloguj się
          </Link>
        </Typography>
      </ScrollView>
    </SafeAreaView>
  );
}
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      height: "100%",
      paddingHorizontal: theme.spacing * 6,
      alignItems: "center",
    },
    title: { alignSelf: "center", marginBottom: theme.spacing * 7 },
    input: { marginVertical: theme.spacing },
    link: {
      alignSelf: "center",
      marginTop: theme.spacing * 2.5,
      color: theme.colors.darkBlue,
      textDecorationLine: "underline",
      opacity: theme.opacity,
      ...theme.text.xs,
    },
    registerLink: {
      alignSelf: "center",
      justifyContent: "flex-end",
      marginTop: theme.spacing * 5,
    },
    button: {
      marginTop: theme.spacing * 5,
      width: "100%",
    },
    background: {
      backgroundColor: theme.colors.lightBlue,
    },
  })
);
