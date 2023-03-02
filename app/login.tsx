import React, { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../db";
import { Button, Input } from "react-native-elements";

export default function Login() {
  // TODO try to move to react-query
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signInWithEmail = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }, [email, password]);

  const signUpWithEmail = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }, [email, password]);

  return (
    <View>
      <Input
        label="Email"
        leftIcon={{ type: "font-awesome", name: "envelope" }}
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="email@address.com"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        leftIcon={{ type: "font-awesome", name: "lock" }}
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
        placeholder="Password"
        autoCapitalize="none"
      />
      <Button
        title="Login"
        disabled={loading}
        onPress={() => signInWithEmail()}
      />
      <Button
        title="Register"
        disabled={loading}
        onPress={() => signUpWithEmail()}
      />
    </View>
  );
}
