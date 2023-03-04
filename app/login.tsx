import React, { useCallback, useState } from "react";
import { Alert, Image } from "react-native";
import { supabase } from "../db";
import { Input } from "react-native-elements";
import { Button } from "../components/Button";
import { Link } from "expo-router";
import { Card } from "../components/Card";

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
    <>
      <Card
        padding="normal"
        style={{
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <Image
          source={require("../assets/images/logo.png")}
          resizeMode="contain"
          style={{
            width: 256,
            height: 256,
            marginHorizontal: "auto",
          }}
        />
      </Card>
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
        type="primary"
        size="l"
        label="Register"
        disabled={loading}
        containerStyle={{ marginHorizontal: "auto", width: 160 }}
        onPress={() => signUpWithEmail()}
      />
      <Button
        type="secondary"
        size="l"
        label="Login"
        disabled={loading}
        containerStyle={{ marginHorizontal: "auto", width: 160 }}
        onPress={() => signInWithEmail()}
      />
      <Link href={""}>Regulamin</Link>
    </>
  );
}
