import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Input } from "react-native-elements";

import { SessionContext, supabase, useGetUser, useUpdateUser } from "../db";
const { useRouter } = require("expo-router");

export default function AccountDetails() {
  const { session } = useContext(SessionContext);
  const { data: user, isLoading } = useGetUser();
  // TODO try to move to @tanstack/react-query
  const [username, setUsername] = useState(user?.username || "");
  const [companyName, setCompanyName] = useState(user?.company_name || "");
  useEffect(() => {
    setUsername(user?.username || "");
    setCompanyName(user?.company_name || "");
  }, [user]);
  const updateUser = useUpdateUser();
  const router = useRouter();

  return (
    <View>
      <Input label="Email" value={session?.user?.email} disabled />
      <Input
        label="Username"
        value={username || ""}
        onChangeText={(text) => setUsername(text)}
      />
      <Input
        label="Company name"
        value={companyName || ""}
        onChangeText={(text) => setCompanyName(text)}
      />
      <Button
        title={isLoading ? "Loading ..." : "Update"}
        onPress={() => updateUser.mutate({ username, companyName })}
        disabled={isLoading}
      />
      <Button
        title="Sign Out"
        onPress={() => {
          supabase.auth.signOut();
          router.push("/login");
        }}
      />
    </View>
  );
}
