<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { Card, Button, Label, Input, Checkbox, Span, Heading, Hr } from "flowbite-svelte";
  import { Icon } from "flowbite-svelte-icons";

  let loading = false;
  let email = "";
  let password = "";

  const handleLogin = async () => {
    try {
      loading = true;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log(data, error);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      loading = false;
    }
  };
  const handleGoogleLogin = async () => {
    try {
      loading = true;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      console.log(data, error);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      loading = false;
    }
  };
  const handleSendLink = async () => {
    const res = await supabase.auth.signInWithOtp({
      email: "felix.lipski7@gmail.com",
      options: {
        emailRedirectTo: "https://example.com/welcome",
      },
    });
    console.log(res);
  };
</script>

<div class="grid h-screen place-items-center">
  <Card class="w-full max-w-md">
    <form class="flex flex-col space-y-6" on:submit|preventDefault={handleLogin}>
      <Heading tag="h3">Logowanie</Heading>
      <Label class="space-y-2">
        <Span>E-mail</Span>
        <Input type="email" name="email" placeholder="Your email" required bind:value={email} />
      </Label>
      <Label class="space-y-2">
        <Span>Hasło</Span>
        <Input type="password" name="password" placeholder="•••••" required bind:value={password} />
      </Label>
      <div class="flex items-start">
        <Checkbox>Zapamiętaj mnie</Checkbox>
        <a href="/" class="ml-auto text-sm text-primary-800 hover:underline dark:text-primary-500">
          Przypomnij hasło
        </a>
      </div>
      <Button type="submit">Zaloguj się</Button>
      <Hr />
      <Button class="flex justify-center" on:click={handleGoogleLogin}>
        <Icon name="google-solid" class="mr-2" />
        Zaloguj się z Google
      </Button>
      <!-- <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
         <a href="/" class="text-primary-800 hover:underline dark:text-primary-500">
          Create account
        </a>
      </div> -->
    </form>
  </Card>
</div>
