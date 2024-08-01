import { StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";

const BADGE_SIDE_SIZE = 20;
const PADDING = 4;

export const useAliasesStyles = createStyles((theme) =>
  StyleSheet.create({
    bg: {
      backgroundColor: theme.colors.darkBlue,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.colors.darkBlue,
      height: "100%",
      paddingHorizontal: theme.spacing * 2,
    },
    dropdown: { marginTop: -theme.spacing * 3 },
    saveButtonContainer: {
      marginTop: theme.spacing * 2,
      flexShrink: 1,
    },
    checkmarkBadgePosition: {
      position: "relative",
      top: BADGE_SIDE_SIZE - 10,
      left: BADGE_SIDE_SIZE + PADDING + 5,
      zIndex: 10,
    },
    indexBadgePosition: {
      position: "relative",
      top: -10,
      left: 5,
      zIndex: 10,
    },
  })
);
