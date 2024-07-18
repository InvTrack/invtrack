import { StyleSheet, View, ViewStyle } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { CheckmarkIcon } from "../Icon";

export const Badge = ({
  isShown,
  containerStyle,
}: {
  isShown: boolean;
  containerStyle?: ViewStyle;
}) => {
  const styles = useStyles();
  return isShown ? (
    <View style={[styles.badge, styles.badgeSize, containerStyle]}>
      <CheckmarkIcon color="black" size={12} />
    </View>
  ) : (
    <View style={[styles.badgeSize, containerStyle]}></View>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
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
