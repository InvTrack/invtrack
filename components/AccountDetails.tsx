import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Input } from "react-native-elements";
import { useGetUser, useUpdateUser, SessionContext, supabase } from "../db";

export function AccountDetails() {
  const { session } = useContext(SessionContext);
  const { data: user, isLoading } = useGetUser();
  const [username, setUsername] = useState(user?.username);
  const [companyName, setCompanyName] = useState(user?.company_name);
  useEffect(() => {
    setUsername(user?.username);
    setCompanyName(user?.company_name);
  }, [user]);
  const updateUser = useUpdateUser();

  return (
    <View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={username || ""}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Company name"
          value={companyName || ""}
          onChangeText={(text) => setCompanyName(text)}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={isLoading ? "Loading ..." : "Update"}
          onPress={() => updateUser.mutate({ username, companyName })}
          disabled={isLoading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
