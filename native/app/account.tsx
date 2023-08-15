import React from "react";

import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import TextInputController from "../components/TextInputController";

import { supabase, useGetUser, useUpdateUser } from "../db";
import { useSession } from "../db/hooks/sessionContext";

export default function AccountDetails() {
  const { session } = useSession();
  const { data: user, isLoading } = useGetUser();

  const updateUser = useUpdateUser();
  const router = useRouter();
  const { control } = useForm();
  return (
    <SafeAreaView edges={["left", "right"]}>
      <TextInputController
        control={control}
        name="email"
        textInputProps={{
          placeholder: session?.user?.email,
        }}
      />
      <TextInputController
        control={control}
        name="username"
        textInputProps={{
          placeholder: user?.username,
        }}
      />
      <TextInputController
        control={control}
        name="companyName"
        textInputProps={{
          placeholder: user?.company_name,
        }}
      />
      <Button
        onPress={() =>
          updateUser.mutate({
            username: user?.username,
            companyName: user?.company_name,
          })
        }
        type="primary"
        size="s"
        fullWidth
        disabled={isLoading}
      >
        {isLoading ? "Ładowanie ..." : "Aktualizuj"}
      </Button>
      <Button
        onPress={() => {
          supabase.auth.signOut();
          router.push("/login");
        }}
        type="secondary"
        size="s"
        fullWidth
      >
        Wyloguj się
      </Button>

      {/* <Input label="Email" value={session?.user?.email} disabled />
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
      /> */}
    </SafeAreaView>
  );
}
