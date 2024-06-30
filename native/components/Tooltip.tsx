import { StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "../theme/useStyles";
import { useBottomSheet } from "./BottomSheet";
import { InfoIcon } from "./Icon";
import { Typography } from "./Typography";

export const Tooltip = ({
  title,
  textContent,
  iconContainerStyle,
}: {
  title: string;
  textContent: string;
  iconContainerStyle?: ViewStyle;
}) => {
  const styles = useStyles();
  const { bottom } = useSafeAreaInsets();
  const { openBottomSheet } = useBottomSheet();

  return (
    <InfoIcon
      size={32}
      color="highlight"
      onPress={() =>
        openBottomSheet(() => (
          <View style={[styles.container, { paddingBottom: bottom + 16 }]}>
            <Typography
              style={styles.title}
              variant={title.length > 22 ? "mBold" : "lBold"}
              color="lightGrey"
            >
              {title}
            </Typography>
            <Typography style={styles.title} variant="m" color="lightGrey">
              {textContent}
            </Typography>
          </View>
        ))
      }
      containerStyle={iconContainerStyle}
    />
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
      paddingTop: theme.spacing,
      paddingHorizontal: theme.spacing * 2,
      minHeight: 200,
    },
    title: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing,
      marginTop: theme.spacing,
    },
  })
);
