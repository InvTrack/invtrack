<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { Card, Button, Label, Input, Checkbox, Span, Heading } from "flowbite-svelte";

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
</script>

<div class="grid h-screen place-items-center">
  <Card class="w-full max-w-md">
    <form class="flex flex-col space-y-6" on:submit|preventDefault={handleLogin}>
      <Heading tag="h3">Sign in to our platform</Heading>
      <Label class="space-y-2">
        <Span>Email</Span>
        <Input type="email" name="email" placeholder="Your email" required bind:value={email} />
      </Label>
      <Label class="space-y-2">
        <Span>Your password</Span>
        <Input type="password" name="password" placeholder="•••••" required bind:value={password} />
      </Label>
      <div class="flex items-start">
        <Checkbox>Remember me</Checkbox>
        <a href="/" class="ml-auto text-sm text-primary-800 hover:underline dark:text-primary-500">
          Lost password?
        </a>
      </div>
      <Button type="submit" class="w-full" color="primary">Login to your account</Button>
      <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
        Not registered? <a href="/" class="text-primary-800 hover:underline dark:text-primary-500">
          Create account
        </a>
      </div>
    </form>
  </Card>
</div>
