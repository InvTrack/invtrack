<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { onMount } from "svelte";
  import type { Views } from "$lib/helpers";
  import { Card } from "flowbite-svelte";

  let current_worker: Views<"worker_for_current_user"> | null = null;
  let loading = true;
  const handleLogout = () => supabase.auth.signOut();

  onMount(async () => {
    try {
      loading = true;
      const { data, error, status, count } = await supabase
        .from("worker_for_current_user")
        .select()
        .single();
      if (error && status !== 406) throw error;
      if (!data) supabase.auth.signOut();
      current_worker = data;
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <Card>Ładowanie...</Card>
{:else if !current_worker}
  <Card>Pracownik nie został znaleziony<button on:click={handleLogout}>Wyloguj</button></Card>
{:else if !current_worker.company_id}
  <Card
    >Twoje konto nie jest przypisane do żadnej firmy! Skontaktuj się z pomocą techniczną.<button
      on:click={handleLogout}>Wyloguj</button
    ></Card
  >
{:else if !current_worker.is_admin}
  <Card>Nie masz uprawnień do edycji firmy!<button on:click={handleLogout}>Wyloguj</button></Card>
{:else}
  <slot />
{/if}
