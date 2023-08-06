import React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet } from "react-native";

import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import TextInputController from "../../components/TextInputController";
import { Typography } from "../../components/Typography";
import { supabase } from "../../db";
import { createStyles } from "../../theme/useStyles";

type LoginFormValues = {
  email: string;
  password: string;
};
export default function Login() {
  // TODO try to move to @tanstack/react-query

  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });
  const styles = useStyles();
  const onSubmit = async ({ email, password }: LoginFormValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    error && console.log(error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography
        variant="xlBold"
        color="darkBlue"
        underline
        style={styles.title}
      >
        Logowanie
      </Typography>
      <TextInputController
        control={control}
        name="email"
        textInputProps={{ containerStyle: styles.input, placeholder: "email" }}
      />
      <TextInputController
        control={control}
        name="password"
        textInputProps={{
          containerStyle: styles.input,
          placeholder: "password",
          secureTextEntry: true,
        }}
      />
      <Button
        type="primary"
        size="xs"
        shadow
        // disabled={loading}
        containerStyle={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Typography variant="xs" color="darkBlue">
          Zaloguj się
        </Typography>
      </Button>
      <Link href="/login" style={styles.link}>
        Resetowanie hasła
      </Link>
      <Typography style={styles.registerLink}>
        <Typography variant="xs" color="darkBlue" opacity>
          Nie masz konta
        </Typography>
        <Link href="/register" style={styles.link}>
          Zarejestruj się
        </Link>
      </Typography>
    </SafeAreaView>
  );
}
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightBlue,
      height: "100%",
      paddingHorizontal: theme.spacing * 6,
    },
    title: {
      alignSelf: "center",
      marginBottom: theme.spacing * 7,
      marginTop: theme.spacing * 11,
    },
    input: { marginVertical: theme.spacing },
    button: {
      marginTop: theme.spacing * 5,
      width: "100%",
    },
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
  })
);
