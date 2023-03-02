import { Text } from "react-native-elements";
import React from "react";
import { View } from "../../components/Themed";
import { Stack, usePathname } from "expo-router";
import { useRecordPanel } from "../../db";

export default function Product() {
  const pathName = usePathname();
  const recordId = pathName.split("/")[2];
  const recordPanel = useRecordPanel(recordId);

  if (recordPanel.isLoading)
    return <Stack.Screen options={{ title: "Loading" }} />;

  const { name, quantity, unit, setQuantity, steppers } = recordPanel;

  const quantityText = unit ? "Ilość: " + quantity + unit : null;

  return (
    <>
      <Stack.Screen options={{ title: name || "" }} />
      <View>
        <View>
          {steppers.negative.map(({ click, step }, i) => (
            <Text key={i} onPress={click}>
              -{step}
            </Text>
          ))}
        </View>
        {quantityText ? <Text>{quantityText}</Text> : null}
        <View>
          {steppers.positive.map(({ click, step }, i) => (
            <Text key={i} onPress={click}>
              +{step}
            </Text>
          ))}
        </View>
      </View>
    </>
  );
}
