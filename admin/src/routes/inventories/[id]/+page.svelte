<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import { genericUpdate } from "$lib/genericUpdate";
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

  const deleteInventory = () =>
    genericUpdate(supabase.from("inventory").delete().eq("id", id), "/inventories");
</script>

{#if inventory}
  <ScreenCard header={"Inventory - " + inventory.name} class="flex flex-col">
    <form on:submit|preventDefault={update} class="flex-1">
      <Label class="space-y-2">
        <Span>Nazwa</Span>
        <Input type="text" name="name" placeholder="Name" bind:value={name} />
      </Label>
      <Label class="space-y-2 mt-2">
        <Span>Data</Span>
        <Input type="text" name="date" placeholder="Date" bind:value={date} />
      </Label>
      <Button type="submit" class="mt-4" color="primary"
        >{loading ? "Saving ..." : "Update inventory"}</Button
      >
    </form>
    <Button type="submit" class="w-fit self-end" color="red" on:click={deleteInventory}
      >Usuń tę inwentaryzację</Button
    >
  </ScreenCard>
{/if}
