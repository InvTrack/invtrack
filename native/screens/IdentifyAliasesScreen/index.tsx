import { StyleSheet } from "react-native";
import SafeLayout from "../../components/SafeLayout";
import { IdentifyAliasesScreenProps } from "../../navigation/types";
import { createStyles } from "../../theme/useStyles";
import { IdentifyAliasesScreenInvoice } from "./Invoice";
import { IdentifyAliasesScreenSalesRaport } from "./SalesRaport";

export const IdentifyAliasesScreen = ({
  route,
}: IdentifyAliasesScreenProps) => {
  const { isScanningSalesRaport } = route.params;
  const styles = useStyles();

  return (
    <SafeLayout
      style={[styles.container, styles.bg]}
      containerStyle={styles.bg}
      contentContainerStyle={styles.bg}
      scrollable
    >
      {isScanningSalesRaport ? (
        <IdentifyAliasesScreenSalesRaport />
      ) : (
        <IdentifyAliasesScreenInvoice />
      )}
    </SafeLayout>
  );
};

const useStyles = createStyles((theme) =>
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
  })
);
