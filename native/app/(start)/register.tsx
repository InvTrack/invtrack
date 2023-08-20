import React from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
} from "react-native";

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
  const [isLoading, setIsLoading] = React.useState(false);
  const styles = useStyles();
  const { control, handleSubmit, watch, trigger, setError } =
    useForm<FormValues>({
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

  React.useEffect(() => {
    trigger("passwordRepeat");
  }, [watch("password"), trigger]);

  const onSubmit = async ({ email, password }: FormValues) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setIsLoading(false);
    if (error?.message === "User already registered") {
      setError("passwordRepeat", {
        message: "Użytkownik już istnieje",
      });
    }
    error && console.log(error, error.cause, error.status, error.message);
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={[styles.background]}>
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
          textInputProps={{
            placeholder: "imię",
            containerStyle: styles.input,
          }}
          rules={{
            required: {
              value: true,
              message: "Imię jest wymagane",
            },
            minLength: {
              value: 2,
              message: "Imię musi mieć minimum 2 znaki",
            },
          }}
        />
        <TextInputController
          name="surname"
          control={control}
          textInputProps={{
            placeholder: "nazwisko",
            containerStyle: styles.input,
          }}
          rules={{
            required: {
              value: true,
              message: "Nazwisko jest wymagane",
            },
            minLength: {
              value: 2,
              message: "Nazwisko musi mieć minimum 2 znaki",
            },
          }}
        />
        <TextInputController
          name="email"
          control={control}
          textInputProps={{
            placeholder: "e-mail",
            containerStyle: styles.input,
            keyboardType: "email-address",
          }}
          rules={{
            pattern: {
              // TODO: server validation?
              value: /^[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,4}$/,
              message: "Nieprawidłowy adres e-mail",
            },
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
        <TextInputController
          name="passwordRepeat"
          control={control}
          textInputProps={{
            placeholder: "powtórz hasło",
            secureTextEntry: true,
            containerStyle: styles.input,
          }}
          rules={{
            required: {
              value: true,
              message: "",
            },
            validate: (value, formValues) =>
              value === formValues.password
                ? true
                : "Hasła muszą być takie same",
          }}
        />
        <Button
          type="primary"
          size="xs"
          shadow
          containerStyle={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          {isLoading ? <ActivityIndicator size={17} /> : "Zarejestruj się"}
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
      height: "120%",
      paddingHorizontal: theme.spacing * 6,
      paddingTop: theme.spacing * 3,
      alignItems: "center",
    },
    title: { alignSelf: "center", marginBottom: theme.spacing * 7 },
    input: { marginVertical: theme.spacing },
    link: {
      alignSelf: "center",
      paddingTop: theme.spacing * 2.5,
      color: theme.colors.darkBlue,
      textDecorationLine: "underline",
      opacity: theme.opacity,
      ...theme.text.xs,
    },
    registerLink: {
      alignSelf: "center",
      justifyContent: "flex-end",
      paddingTop: theme.spacing * 5,
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
