<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";
  import Card from "$lib/main/Card.svelte";
  import { genericGet } from "$lib/genericGet";
  import { genericUpdate } from "$lib/genericUpdate";
  import SubmitButton from "$lib/form/SubmitButton.svelte";
  import TextInput from "$lib/form/TextInput.svelte";

  let loading = false;
  let inventory: Tables<"inventory"> | null = null;
  const id = $page.params.id;
  onMount(() =>
    genericGet(supabase.from("inventory").select().eq("id", id).single(), (x) => {
      inventory = x;
      name = inventory.name;
      date = inventory.date;
    })
  );

  let name: string | undefined = undefined;
  let date: string = "";

  const update = () =>
    genericUpdate(
      supabase
        .from("inventory")
        .update({
          name,
          date,
        })
        .eq("id", id),
      "/inventories",
      (x) => (loading = x)
    );
</script>

{#if inventory}
  <Card header={"Inventory - " + inventory.name}>
    <form method="post" on:submit|preventDefault={update}>
      <TextInput name="name" bind:value={name}>Name</TextInput>
      <TextInput name="date" bind:value={date}>Date</TextInput>
      <SubmitButton>{loading ? "Saving ..." : "Update inventory"}</SubmitButton>
    </form>
  </Card>
{/if}
