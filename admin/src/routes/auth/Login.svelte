<script lang="ts">
  import { Button, Label, Input, Span, Heading, Hr } from "flowbite-svelte";
  import GoogleLogin from "./GoogleLogin.svelte";
  import { mapApiErrors } from "$lib/mapApiErrors";
  import { goto } from "$app/navigation";

  // TODO SUPABASE
  export let supabase: any;

  let loading = false;
  let email = "";
  let password = "";
  let errorMessage: string | null = null;

  export let switchSiteState = () => {};

  const handleSubmit = async () => {
    try {
      loading = true;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      goto("/");
    } catch (error) {
      if (error instanceof Error) {
        errorMessage = mapApiErrors(error);
        if (!errorMessage) alert(error.message);
      }
    }
  };
</script>

<form class="flex flex-col space-y-6" on:submit|preventDefault={handleSubmit}>
  <Heading tag="h3">Logowanie</Heading>
  <Label class="space-y-2">
    <Span>E-mail</Span>
    <Input type="email" name="email" placeholder="Your email" required bind:value={email} />
  </Label>
  <Label class="space-y-2">
    <Span>Hasło</Span>
    <Input type="password" name="password" placeholder="••••••" required bind:value={password} />
  </Label>
  {#if errorMessage}
    <div class="text-red-500">{errorMessage}</div>
  {/if}
  <Button type="submit">Zaloguj się</Button>
  <p>
    Nie masz konta? <span
      role="button"
      on:click={switchSiteState}
      on:keydown={switchSiteState}
      tabindex="0"
      class="ml-auto text-sm text-primary-800 hover:underline dark:text-primary-500"
      >Zarejstruj się!</span
    >
  </p>
</form>
