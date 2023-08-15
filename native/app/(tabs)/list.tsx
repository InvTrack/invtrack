import capitalize from "lodash/capitalize";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InventoryCardAdd } from "../../components/InventoryCard/InventoryCardAdd";
import { InventoryCardLink } from "../../components/InventoryCard/InventoryCardLink";
import { Typography } from "../../components/Typography";
import { useListInventories } from "../../db";
import { createStyles } from "../../theme/useStyles";

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

const groupByDay = (data: ReturnType<typeof useListInventories>["data"]) => {
  if (!data) return null;
  const days: { [key: string]: typeof data } = {};
  data.reverse().forEach((item) => {
    const day = new Date(item.created_at).toLocaleString("pl-PL", {
      day: "numeric",
      month: "numeric",
    });
    if (!days[day]) {
      days[day] = [];
    }
    days[day].push(item);
  });
  return Object.entries(days);
};

const groupDaysByMonth = (groupedByDay: ReturnType<typeof groupByDay>) => {
  if (!groupedByDay) return null;
  const months: { [key: string]: typeof groupedByDay } = {};
  groupedByDay.forEach(([day, inventories]) => {
    const month = new Date(inventories[0].created_at).toLocaleString("pl-PL", {
      month: "long",
    });
    const capitalizedMonth = capitalize(month);
    if (!months[capitalizedMonth]) {
      months[capitalizedMonth] = [];
    }
    months[capitalizedMonth].push([day, inventories]);
  });

  return Object.entries(months);
};

const ListIndex = () => {
  const styles = useStyles();
  const { data: inventoryList } = useListInventories();
  const months = useMemo(
    () => groupDaysByMonth(groupByDay(inventoryList)),
    [inventoryList]
  );

  if (!inventoryList || !months) return null;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {months.map(([month, days]) => (
          <React.Fragment key={month}>
            <MonthTitle title={month} />
            {days.map(([day, inventories]) => (
              <React.Fragment key={day}>
                <DayTitle title={day} />
                {inventories.map((inventory) => (
                  <InventoryCardLink
                    key={inventory.id}
                    title={inventory.name}
                    inventoryId={inventory.id}
                  />
                ))}
                <InventoryCardAdd />
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
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
