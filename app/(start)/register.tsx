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
        variant="xl"
        color="darkBlue"
        underline
        style={{ alignSelf: "center", marginVertical: 56 }}
      >
        Rejestracja
      </Typography>
      <TextInput placeholder="name" containerStyle={styles.input} />
      <TextInput placeholder="surname" containerStyle={styles.input} />
      <TextInput placeholder="e-mail" containerStyle={styles.input} />
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
    input: { marginVertical: theme.spacing },
  })
);
