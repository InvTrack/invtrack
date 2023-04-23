import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button } from "../../components/Button";
import { Link } from "expo-router";
import { Card } from "../../components/Card";
import { createStyles } from "../../theme/useStyles";

export default function Login() {
  const styles = useStyles();
  // TODO try to move to react-query

  return (
    <View style={styles.container}>
      <Card borderBottom padding="normal" style={styles.card}>
        <Image
          source={require("../../assets/images/logo.png")}
          resizeMode="contain"
          style={styles.logoImage}
        />
      </Card>
      <Link href="/register" asChild>
        <Button
          type="primary"
          size="l"
          label="Register"
          containerStyle={styles.button}
        />
      </Link>
      <Link href="/login" asChild>
        <Button
          type="secondary"
          size="l"
          label="Login"
          containerStyle={styles.button}
        />
      </Link>
      <Link href={""}>Regulamin</Link>
    </View>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.lightBlue, height: "100%" },
    card: {
      ...theme.baseShadow,
      justifyContent: "center",
      alignContent: "center",
      marginBottom: theme.spacing * 11,
    },
    logoImage: {
      width: 256,
      height: 256,
      marginHorizontal: "auto",
    },
    button: {
      marginHorizontal: "auto",
      width: 200,
      marginBottom: theme.spacing * 2.5,
    },
  })
);
