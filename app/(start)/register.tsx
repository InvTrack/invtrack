import { Link } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "../../components/TextInput";
import { Typography } from "../../components/Typography";
import { createStyles } from "../../theme/useStyles";
export default function Register() {
  const styles = useStyles();
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
      <TextInput placeholder="imię" containerStyle={styles.input} />
      <TextInput placeholder="nazwisko" containerStyle={styles.input} />
      <TextInput placeholder="e-mail" containerStyle={styles.input} />
      <TextInput
        placeholder="hasło"
        secureTextEntry
        containerStyle={styles.input}
      />
      <TextInput
        placeholder="powtórz hasło"
        secureTextEntry
        containerStyle={styles.input}
      />
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
  })
);
