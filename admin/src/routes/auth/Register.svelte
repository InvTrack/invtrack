<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { Button, Label, Input, Span, Heading, Hr } from "flowbite-svelte";
  import GoogleLogin from "./GoogleLogin.svelte";
  import { mapApiErrors } from "$lib/mapApiErrors";

  let loading = false;
  let email = "";
  let password = "";
  let passwordRepeat = "";
  let errorMessage: string | null = null;

  export let switchSiteState = () => {};

  const handleSubmit = async () => {
    if (password !== passwordRepeat) return (errorMessage = "Hasła nie są takie same!");
    try {
      loading = true;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      console.log(data, error);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        errorMessage = mapApiErrors(error);
        if (!errorMessage) alert(error.message);
      }
    } finally {
      loading = false;
    }
  };
</script>

<form class="flex flex-col space-y-6" on:submit|preventDefault={handleSubmit}>
  <Heading tag="h3">Rejestracja</Heading>
  <Label class="space-y-2">
    <Span>E-mail</Span>
    <Input type="email" name="email" placeholder="Your email" required bind:value={email} />
  </Label>
  <Label class="space-y-2">
    <Span>Hasło</Span>
    <Input type="password" name="password" placeholder="••••••" required bind:value={password} />
  </Label>
  <Label class="space-y-2">
    <Span>Powtórz hasło</Span>
    <Input
      type="password"
      name="password-repeat"
      placeholder="••••••"
      required
      bind:value={passwordRepeat}
    />
  </Label>
  {#if errorMessage}
    <div class="text-red-500">{errorMessage}</div>
  {/if}
  <Button type="submit">Zarejstruj się</Button>
  <p>
    Masz już konto? <span
      role="button"
      on:click={switchSiteState}
      on:keydown={switchSiteState}
      tabindex="0"
      class="ml-auto text-sm text-primary-800 hover:underline dark:text-primary-500"
      >Zaloguj się!</span
    >
  </p>
  <Hr />
  <GoogleLogin />
</form>
