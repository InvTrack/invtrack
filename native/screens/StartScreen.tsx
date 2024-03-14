import React from "react";
import { Image, StyleSheet } from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
// import { Button } from "../components/Button";
import { Card } from "../components/Card";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "../components/Button";
import { DevInfo } from "../components/DevInfo";
import { PrivacyPolicy } from "../components/PrivacyPolicy";
import { Typography } from "../components/Typography";
import { LoginStackParamList } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

export type StartScreenProps = NativeStackScreenProps<
  LoginStackParamList,
  "StartScreen"
>;

export default function StartScreen({ navigation }: StartScreenProps) {
  const styles = useStyles();
  const { top: safeAreaTopInset } = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <Card
        color="mediumBlue"
        borderBottom
        padding="normal"
        style={[styles.card, { paddingTop: safeAreaTopInset }]}
      >
        <Image
          source={require("../assets/images/logo.png")}
          resizeMode="contain"
          style={styles.logoImage}
        />
        <Typography color="lightGrey" style={styles.logoText}>
          InvTrack
        </Typography>
      </Card>
      <Button
        type="primary"
        size="l"
        containerStyle={styles.button}
        onPress={() => {
          navigation.navigate("LoginScreen");
        }}
      >
        Zaloguj się
      </Button>
      <PrivacyPolicy />

      <DevInfo />
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
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
