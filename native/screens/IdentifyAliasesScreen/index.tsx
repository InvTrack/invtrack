import { StyleSheet } from "react-native";
import SafeLayout from "../../components/common/SafeLayout";
import { IdentifyAliasesScreenProps } from "../../navigation/types";
import { createStyles } from "../../theme/useStyles";
import { IdentifyAliasesScreenInvoice } from "./Invoice";
import { IdentifyAliasesScreenSalesRaport } from "./SalesRaport";

export const IdentifyAliasesScreen = ({
  route,
}: IdentifyAliasesScreenProps) => {
  const {
    isScanningSalesRaport,
    processedInvoice,
    processedSalesReport,
    stockId,
  } = route.params;
  const styles = useStyles();

  return (
    <SafeLayout
      style={[styles.container, styles.bg]}
      containerStyle={styles.bg}
      contentContainerStyle={styles.bg}
      scrollable
    >
      {isScanningSalesRaport ? (
        <IdentifyAliasesScreenSalesRaport
          processedSalesReport={processedSalesReport}
          stockId={stockId}
        />
      ) : (
        <IdentifyAliasesScreenInvoice
          processedInvoice={processedInvoice}
          stockId={stockId}
        />
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
