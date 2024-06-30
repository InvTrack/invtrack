import { StyleSheet, View, ViewStyle } from "react-native";
import { createStyles } from "../theme/useStyles";
import { Typography } from "./Typography";

export const IndexBadge = ({
  index,
  containerStyle,
}: {
  index: number;
  containerStyle?: ViewStyle;
}) => {
  const styles = useStyles();
  return (
    <View style={[styles.badge, styles.badgeSize, containerStyle]}>
      <Typography variant="xs">{index}</Typography>
    </View>
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
      backgroundColor: theme.colors.highlight,
      alignItems: "center",
      justifyContent: "center",
    },
  })
);
