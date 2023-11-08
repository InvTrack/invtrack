<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { onMount } from "svelte";
  import type { Views } from "$lib/helpers";
  import { Card } from "flowbite-svelte";

  let current_worker: Views<"worker_for_current_user"> | null = null;
  let loading = true;

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
  <Card>Loading...</Card>
{:else if !current_worker}
  <Card>Worker not found</Card>
{:else if !current_worker.company_id}
  <Card>Your account is not assigned to any company! Contact support.</Card>
{:else if !current_worker.is_admin}
  <Card>You are not authorized to edit a company!</Card>
{:else}
  <slot />
{/if}
