import { View } from "react-native";
import { createStyles } from "../../theme/useStyles";

export const CollapsibleItem = ({
  isFirst = false,
  isLast = false,
  children,
}: {
  isFirst?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}) => {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.borderLeft,
        styles.borderRight,
        isFirst ? styles.pt : null,
        isLast ? styles.borderBottom : null,
        isLast ? styles.pb : null,
      ]}
    >
      {children}
    </View>
  );
};

const useStyles = createStyles((theme) => ({
  borderLeft: {
    paddingLeft: theme.spacing,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.highlight,
  },
  borderRight: {
    paddingRight: theme.spacing,
    borderRightWidth: 3,
    borderRightColor: theme.colors.highlight,
  },
  borderBottom: {
    paddingRight: 8,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.highlight,
    borderBottomLeftRadius: theme.borderRadiusSmall,
    borderBottomRightRadius: theme.borderRadiusSmall,
  },
  pt: { paddingTop: 8 },
  pb: { paddingBottom: 8 },
}));
