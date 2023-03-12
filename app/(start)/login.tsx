import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { supabase } from "../../db";
import { Button } from "../../components/Button";
import { Link } from "expo-router";
import { TextInput } from "../../components/TextInput";
import { createStyles } from "../../theme/useStyles";
import { Typography } from "../../components/Typography";

export default function Login() {
  // TODO try to move to react-query
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = useStyles();
  const signInWithEmail = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }, [email, password]);

  const signUpWithEmail = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }, [email, password]);

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
      <TextInput containerStyle={styles.input} placeholder="e-mail" />
      <TextInput
        containerStyle={styles.input}
        secureTextEntry
        placeholder="hasło"
      />
      <Button
        type="primary"
        size="xs"
        label="Zaloguj się"
        shadow
        disabled={loading}
        containerStyle={styles.button}
        onPress={() => signInWithEmail()}
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
    button: { marginTop: theme.spacing * 4.5, width: "100%" },
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
