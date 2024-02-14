<script lang="ts">
  import { onMount } from "svelte";
  import type { Views } from "$lib/helpers";
  import CenterCard from "./CenterCard.svelte";
  import Login from "./Login.svelte";
  import Register from "./Register.svelte";

  export let data;
  let { supabase, session } = data;
  $: ({ supabase, session } = data);

  let current_worker: Views<"worker_for_current_user"> | null = null;
  let loading = true;
  const handleLogout = () => supabase.auth.signOut();

  let siteState: "logging" | "registering" = "logging";
  let switchSiteState = () => {
    siteState = siteState === "logging" ? "registering" : "logging";
  };
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

<!--  -->
<!--  -->
<!--  -->
{#if session}
  {#if loading}
    <CenterCard>Ładowanie...</CenterCard>
  {:else if !current_worker}
    <CenterCard
      >Pracownik nie został znaleziony<button on:click={handleLogout}>Wyloguj</button></CenterCard
    >
  {:else if !current_worker.company_id}
    <CenterCard>
      Twoje konto nie jest przypisane do żadnej firmy! Skontaktuj się z pomocą techniczną.<button
        on:click={handleLogout}>Wyloguj</button
      >
    </CenterCard>
  {:else if !current_worker.is_admin}
    <CenterCard
      >Nie masz uprawnień do edycji firmy!<button on:click={handleLogout}>Wyloguj</button
      ></CenterCard
    >
  {/if}
{:else}
  <CenterCard>
    {#if siteState === "logging"}
      <Login {switchSiteState} {supabase} />
    {:else if siteState === "registering"}
      <Register {switchSiteState} {supabase} />
    {/if}
  </CenterCard>
{/if}
