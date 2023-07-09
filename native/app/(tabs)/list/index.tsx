import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InventoryCardAdd } from "../../../components/InventoryCard/InventoryCardAdd";
import { InventoryCardLink } from "../../../components/InventoryCard/InventoryCardLink";
import { Typography } from "../../../components/Typography";
import { createStyles } from "../../../theme/useStyles";

const MonthTitle = ({ title }: { title: string }) => {
  return (
    <Typography underline variant="xlBold" color="darkBlue">
      {title}
    </Typography>
  );
};
const DayTitle = ({ title }: { title: string }) => {
  return (
    <Typography variant="l" color="grey" style={{ paddingVertical: 16 }}>
      {title}
    </Typography>
  );
};
const ListIndex = () => {
  const styles = useStyles();

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MonthTitle title="Marzec" />
        <DayTitle title="21.03" />
        <InventoryCardLink title="Inwentaryzacja 1" />
        <InventoryCardAdd />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    screen: {
      backgroundColor: theme.colors.lightBlue,
      height: "100%",
    },
    scroll: {
      paddingHorizontal: theme.spacing * 4,
      paddingTop: theme.spacing * 2,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing * 3,
      paddingRight: theme.spacing * 2,
      marginBottom: theme.spacing * 2,
      height: 45,
      borderRadius: theme.borderRadiusSmall,
    },
    plusCard: {
      height: 45,
      borderRadius: theme.borderRadiusSmall,
      alignItems: "center",
      justifyContent: "center",
    },
  })
);
export default ListIndex;
