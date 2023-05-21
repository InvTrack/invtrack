import { Link } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { Button } from "../../components/Button";
import TextInputController from "../../components/TextInputController";
import { Typography } from "../../components/Typography";
import { supabase } from "../../db";
import { createStyles } from "../../theme/useStyles";

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
  });

  const onSubmit = async ({ email, password, ...props }: FormValues) => {
    console.log(props);
    const { error } = await supabase.auth.signUp({
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
        <Typography variant="xs">Zarejestruj się</Typography>
      </Button>
      <Typography style={styles.registerLink}>
        <Typography variant="xs" color="darkBlue" opacity>
          Masz już konto?{" "}
        </Typography>
        <Link href={"/register"} style={styles.link}>
          Zaloguj się
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
    button: { marginTop: theme.spacing * 5, width: "100%" },
  })
);
