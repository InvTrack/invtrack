import React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { LoadingSpinner } from "../components/LoadingSpinner";
import TextInputController from "../components/TextInputController";
import { Typography } from "../components/Typography";
import { supabase } from "../db";
import { LoginStackParamList } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

type LoginFormValues = {
  email: string;
  password: string;
};
type LoginScreenProps = NativeStackScreenProps<
  LoginStackParamList,
  "LoginScreen"
>;

export default function LoginScreen({}: LoginScreenProps) {
  const styles = useStyles();

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
    <SafeAreaView style={styles.container}>
      <Typography variant="xlBold" color="new_darkGrey" style={styles.title}>
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
        size="s"
        shadow
        containerStyle={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        {isLoading ? <LoadingSpinner /> : "Zaloguj się"}
      </Button>
      {/* <Link href="/login" style={styles.link}>
        Resetowanie hasła
      </Link> */}
    </SafeAreaView>
  );
}
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.new_darkBlue,
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
      alignSelf: "center",
    },
    link: {
      alignSelf: "center",
      marginTop: theme.spacing * 2.5,
      color: theme.colors.new_darkBlue,
      textDecorationLine: "underline",
      opacity: theme.opacity,
      ...theme.text.xs,
    },
  })
);
