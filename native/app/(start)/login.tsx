import React from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet } from "react-native";

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
  const [isLoading, setIsLoading] = React.useState(false);
  const { control, handleSubmit, setError } = useForm<LoginFormValues>({
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
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);

    if (error?.status === 400) {
      error && console.log(error);
      setError("password", { message: "Nieprawidłowy email i/lub hasło" });
    }
    error && console.log(error);
  };

  return (
    <SafeAreaView edges={["left", "bottom", "right"]} style={styles.container}>
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
        textInputProps={{
          containerStyle: styles.input,
          placeholder: "E-mail",
          keyboardType: "email-address",
        }}
        rules={{
          required: {
            value: true,
            message: "Adres e-mail jest wymagany",
          },
        }}
      />
      <TextInputController
        control={control}
        name="password"
        textInputProps={{
          containerStyle: styles.input,
          placeholder: "Hasło",
          secureTextEntry: true,
        }}
        rules={{
          required: {
            value: true,
            message: "Hasło jest wymagane",
          },
          minLength: {
            value: 6,
            message: "Hasło musi mieć minimum 6 znaków",
          },
        }}
      />
      <Button
        type="primary"
        size="xs"
        shadow
        containerStyle={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        {isLoading ? <ActivityIndicator size={17} /> : "Zaloguj się"}
      </Button>
      <Link href="/login" style={styles.link}>
        Resetowanie hasła
      </Link>
      <Typography style={styles.registerLink}>
        <Typography variant="xs" color="darkBlue" opacity>
          Nie masz konta?{" "}
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
      paddingTop: theme.spacing * 3,
    },
    title: {
      alignSelf: "center",
      marginBottom: theme.spacing * 7,
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
