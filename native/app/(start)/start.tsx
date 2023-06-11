import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Typography } from "../../components/Typography";
import { createStyles } from "../../theme/useStyles";
const { Link } = require("expo-router");

export default function Start() {
  const styles = useStyles();

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
        <Button type="primary" size="l" containerStyle={styles.button}>
          <Typography variant="l">Register</Typography>
        </Button>
      </Link>
      <Link href="/login" asChild>
        <Button type="secondary" size="l" containerStyle={styles.button}>
          <Typography variant="l">Login</Typography>
        </Button>
      </Link>
      <Link href="">Regulamin</Link>
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
