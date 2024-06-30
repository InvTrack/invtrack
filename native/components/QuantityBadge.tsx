import { StyleSheet, View, ViewStyle } from "react-native";
import { createStyles } from "../theme/useStyles";
import { Typography } from "./Typography";

export const QuantityBadge = ({
  delta,
  containerStyle,
}: {
  delta: number | null;
  containerStyle?: ViewStyle;
}) => {
  const styles = useStyles();
  if (delta === 0 || delta == null) return null;
  return (
    <View style={containerStyle}>
      <View style={[styles.badgeSize, styles.badge]}>
        <Typography variant="xs">{(delta > 0 ? "+" : "") + delta}</Typography>
      </View>
    </View>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    badgeSize: {
      borderRadius: 20,
      height: 20,
      minWidth: 20,
    },
    badge: {
      padding: 2,
      backgroundColor: theme.colors.highlight,
      alignItems: "center",
      justifyContent: "center",
    },
  })
);
