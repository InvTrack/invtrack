import { StyleSheet, View } from "react-native";
import { createStyles } from "../theme/useStyles";
import { CheckmarkIcon } from "./Icon";

export const Badge = ({ isShown }: { isShown: boolean }) => {
  const styles = useStyles();
  return isShown ? (
    <View style={[styles.badge, styles.badgePosition, styles.badgeSize]}>
      <CheckmarkIcon color="black" size={12} />
    </View>
  ) : (
    <View style={[styles.badgePosition, styles.badgeSize]}></View>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    badgePosition: {
      position: "relative",
      top: 6,
      left: 5,
      zIndex: 10,
    },
    badgeSize: {
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    badge: {
      padding: 2,
      backgroundColor: theme.colors.green,
      alignItems: "center",
      justifyContent: "center",
    },
  })
);
