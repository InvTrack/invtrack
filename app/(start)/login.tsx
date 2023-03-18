import React from "react";
import { StyleSheet, View } from "react-native";
import { supabase } from "../../db";
import { Button } from "../../components/Button";
import { Link } from "expo-router";
import { createStyles } from "../../theme/useStyles";
import { Typography } from "../../components/Typography";
import { useForm } from "react-hook-form";
import TextInputController from "../../components/TextInputController";

type LoginFormValues = {
  email: string;
  password: string;
};
export default function Login() {
  // TODO try to move to react-query

  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
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
    <View style={styles.container}>
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
        label="Zaloguj się"
        shadow
        // disabled={loading}
        containerStyle={styles.button}
        onPress={handleSubmit(onSubmit)}
      />
      <Link href={"/login"} style={styles.link}>
        Resetowanie hasła
      </Link>
      <Typography style={styles.registerLink}>
        <Typography variant="xs" color="darkBlue" opacity>
          Nie masz konta?{" "}
        </Typography>
        <Link href={"/register"} style={styles.link}>
          Zarejestruj się
        </Link>
      </Typography>
    </View>
  );
}
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightBlue,
      height: "100%",
      paddingHorizontal: theme.spacing * 6,
    },
    title: { alignSelf: "center", marginVertical: theme.spacing * 7 },
    input: { marginVertical: theme.spacing },
    button: { marginTop: theme.spacing * 5 },
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
