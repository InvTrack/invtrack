import { StyleSheet, View } from "react-native";
import { createStyles } from "../theme/useStyles";

export const Divider = () => {
  const styles = useStyles();
  return <View style={styles.divider} />;
};
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    divider: {
      marginVertical: theme.spacing * 2,
      height: 1,
      width: "100%",
      backgroundColor: theme.colors.lightGrey,
    },
  })
);
