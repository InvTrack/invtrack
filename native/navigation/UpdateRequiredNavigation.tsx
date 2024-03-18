import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { UpdateRequiredScreen } from "../screens/UpdateRequiredScreen";
import { UpdateRequiredStackParamList } from "./types";

const Stack = createStackNavigator<UpdateRequiredStackParamList>();

export const UpdateRequiredNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={"UpdateRequiredScreen"}>
      <Stack.Screen
        name={"UpdateRequiredScreen"}
        options={{ headerShown: false }}
        component={UpdateRequiredScreen}
      />
    </Stack.Navigator>
  );
};
