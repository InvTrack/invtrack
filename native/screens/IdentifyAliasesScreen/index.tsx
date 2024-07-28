import { StyleSheet } from "react-native";
import SafeLayout from "../../components/common/SafeLayout";
import { IdentifyAliasesScreenProps } from "../../navigation/types";
import { createStyles } from "../../theme/useStyles";
import { IdentifyAliasesComponent } from "./Aliases";

export const IdentifyAliasesScreen = ({
  route,
}: IdentifyAliasesScreenProps) => {
  const { processedInvoice, processedSalesReport, stockId, stockType } =
    route.params;
  const styles = useStyles();

  return (
    <SafeLayout
      style={[styles.container, styles.bg]}
      containerStyle={styles.bg}
      contentContainerStyle={styles.bg}
      scrollable
    >
      {stockType === "delivery" ? (
        <IdentifyAliasesComponent
          stockId={stockId}
          stockType={stockType}
          documentResponse={processedInvoice}
        />
      ) : (
        <IdentifyAliasesComponent
          stockId={stockId}
          stockType={stockType}
          documentResponse={processedSalesReport}
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
