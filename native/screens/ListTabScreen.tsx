import capitalize from "lodash/capitalize";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InventoryCardAdd } from "../components/ListCard/ListCardAdd";

import isEmpty from "lodash/isEmpty";
import { Button } from "../components/Button";
import { EmptyScreenTemplate } from "../components/EmptyScreenTemplate";
import { ListCardLink } from "../components/ListCard/ListCardLink";
import { Skeleton } from "../components/Skeleton";
import { Typography } from "../components/Typography";
import { useListInventories } from "../db";
import { ListTabScreenProps } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

const MonthTitle = ({ title }: { title: string }) => {
  const styles = useStyles();
  return (
    <Typography variant="xlBold" color="highlight" style={styles.monthTitle}>
      {title}
    </Typography>
  );
};
const DayTitle = ({ title }: { title: string }) => {
  const styles = useStyles();
  return (
    <Typography variant="lBold" color="darkGrey" style={styles.dayTitle}>
      {title}
    </Typography>
  );
};

const groupByDay = (data: ReturnType<typeof useListInventories>["data"]) => {
  if (!data) return null;
  const days: { [key: string]: typeof data } = {};
  data.forEach((item) => {
    const day = new Date(item.date).toLocaleString("pl-PL", {
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
    const month = new Date(inventories[0].date).toLocaleString("pl-PL", {
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

export const ListTab = ({ navigation }: ListTabScreenProps) => {
  const styles = useStyles();
  const { data: inventoryList, isLoading: isInventoryListLoading } =
    useListInventories();
  const months = useMemo(
    () => groupDaysByMonth(groupByDay(inventoryList)),
    [inventoryList]
  );

  if (isInventoryListLoading || !months) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.screen}>
        <View style={styles.scroll}>
          <View style={styles.monthTitle}>
            <Skeleton style={{ width: "60%", height: 70 }} />
          </View>
          <View style={styles.dayTitle}>
            <Skeleton style={{ width: "40%", height: 30 }} />
          </View>
          <View>
            <Skeleton style={styles.skeletonListItem} />
            <Skeleton style={styles.skeletonListItem} />
            <Skeleton style={styles.skeletonListItem} />
          </View>
          <View style={styles.dayTitle}>
            <Skeleton style={{ width: "40%", height: 30 }} />
          </View>
          <View>
            <Skeleton style={styles.skeletonListItem} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!isInventoryListLoading && isEmpty(inventoryList)) {
    return (
      <EmptyScreenTemplate style={{ alignItems: "center", gap: 16 }}>
        <Typography variant="l" color="darkGrey">
          Brak danych do wyświetlenia.
        </Typography>
        <Button
          // overriden in styles
          size="m"
          fullWidth
          type="primary"
          onPress={() => {
            navigation.navigate("NewStockScreen" as any);
          }}
        >
          Dodaj pierwszy wpis!
        </Button>
      </EmptyScreenTemplate>
    );
  }

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
                  <ListCardLink
                    key={inventory.id || -1}
                    title={inventory.name}
                    id={inventory.id}
                    isDelivery={inventory.is_delivery}
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
      backgroundColor: theme.colors.darkBlue,
      height: "100%",
    },
    scroll: {
      paddingHorizontal: theme.spacing * 4,
    },
    monthTitle: {
      paddingTop: theme.spacing * 2,
    },
    dayTitle: {
      paddingVertical: theme.spacing * 2,
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
    skeletonListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing * 3,
      paddingRight: theme.spacing * 2,
      marginBottom: theme.spacing * 2,
      height: 45,
      borderRadius: theme.borderRadiusSmall,
    },
  })
);
