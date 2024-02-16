// import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useListProducts } from "../db/hooks/useListProducts";
import { createStyles } from "../theme/useStyles";
import { Button } from "./Button";
import { PlusIcon } from "./Icon";
// import { Dropdown } from "react-native-element-dropdown";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useCreateRecord } from "../db/hooks/useCreateRecord";
import { Product } from "../db/types";

type IDListCardAddProps = {
  productIDs: (number | null)[];
  inventoryId: number;
};

export const IDListCardAdd = ({
  inventoryId,
  productIDs,
}: IDListCardAddProps) => {
  const styles = useStyles();
  const { data, isSuccess } = useListProducts();
  const products = data?.filter((p) => !productIDs.includes(p.id));

  const { mutate } = useCreateRecord();

  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectOption = (product: Product) => {
    mutate({ product_id: product.id, inventory_id: inventoryId, quantity: 0 });
    // setIsOpen(false);
  };

  if (!isSuccess || !products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Button
        // overriden in styles
        size="l"
        fullWidth
        type="primary"
        containerStyle={styles.card}
        onPress={toggleDropdown}
      >
        <PlusIcon size={25} color="darkGrey" />
      </Button>
      {isOpen && (
        <View style={styles.dropdown}>
          {products.map((product: Product, index: any) => (
            <TouchableOpacity
              key={index}
              onPress={() => selectOption(product)}
              style={styles.option}
            >
              <Text style={styles.optionText}>{product.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: theme.spacing * 3,
      paddingRight: theme.spacing * 2,
      marginBottom: theme.spacing * 2,
      height: 45,
      borderRadius: theme.borderRadiusSmall,
      justifyContent: "center",
      alignSelf: "center",
    },
    container: {},
    button: {},
    option: {},
    optionText: {
      color: theme.colors.darkGrey,
    },
    dropdown: {},
  })
);
