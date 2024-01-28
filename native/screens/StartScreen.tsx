import React from "react";
import { Image, StyleSheet } from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
// import { Button } from "../components/Button";
import { Card } from "../components/Card";

import { useNavigation } from "@react-navigation/native";
import { Button } from "../components/Button";
import { Typography } from "../components/Typography";
import { createStyles } from "../theme/useStyles";

export default function StartScreen() {
  const styles = useStyles();
  const { top: safeAreaTopInset } = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <Card
        borderBottom
        padding="normal"
        style={[styles.card, { paddingTop: safeAreaTopInset }]}
      >
        <Image
          source={require("../assets/images/logo.png")}
          resizeMode="contain"
          style={styles.logoImage}
        />
        <Typography color="darkBlue" style={styles.logoText}>
          InvTrack
        </Typography>
      </Card>
      <Button
        type="secondary"
        size="l"
        containerStyle={styles.button}
        onPress={() => {
          navigation.navigate("Login");
        }}
      >
        Zaloguj się
      </Button>
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
