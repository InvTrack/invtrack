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
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Button, Input, Label, Span } from "flowbite-svelte";

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
  <ScreenCard header={"Inventory - " + inventory.name}>
    <form on:submit|preventDefault={update}>
      <Label class="space-y-2">
        <Span>Name</Span>
        <Input type="text" name="name" placeholder="Name" bind:value={name} />
      </Label>
      <Label class="space-y-2 mt-2">
        <Span>Date</Span>
        <Input type="text" name="date" placeholder="Date" bind:value={date} />
      </Label>
      <Button type="submit" class="mt-4" color="primary"
        >{loading ? "Saving ..." : "Update inventory"}</Button
      >
    </form>
  </ScreenCard>
{/if}
