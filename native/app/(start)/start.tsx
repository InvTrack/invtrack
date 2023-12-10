import React from "react";
import { Image, StyleSheet } from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

import { Link } from "expo-router";
import { Typography } from "../../components/Typography";
import { createStyles } from "../../theme/useStyles";

export default function Start() {
  const styles = useStyles();
  const { top: safeAreaTopInset } = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <Card
        borderBottom
        padding="normal"
        style={[styles.card, { paddingTop: safeAreaTopInset }]}
      >
        <Image
          source={require("../../assets/images/logo.png")}
          resizeMode="contain"
          style={styles.logoImage}
        />
        <Typography color="darkBlue" style={styles.logoText}>
          InvTrack
        </Typography>
      </Card>
      <Link href="/login" asChild>
        <Button type="secondary" size="l" containerStyle={styles.button}>
          Zaloguj się
        </Button>
      </Link>
      <Link href="/">Regulamin</Link>
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightBlue,
      height: "100%",
      alignItems: "center",
    },
    card: {
      ...theme.baseShadow,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing * 11,
      width: "100%",
    },
    logoImage: {
      width: 249,
      height: 228,
    },
    logoText: {
      fontSize: 64,
      fontFamily: "latoBold",
      paddingTop: theme.spacing * 5,
      paddingBottom: "10%",
    },
    button: {
      marginHorizontal: "auto",
      width: 200,
      marginBottom: theme.spacing * 2.5,
    },
  })
);
