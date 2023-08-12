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
  let product: Tables<"product"> | null = null;
  const id = $page.params.id;
  onMount(() =>
    genericGet(supabase.from("product").select().eq("id", id).single(), (x) => {
      product = x;
      name = product.name;
      unit = product.unit;
    })
  );

  let name: string | undefined = undefined;
  let unit: string | undefined = undefined;

  const update = () =>
    genericUpdate(
      supabase
        .from("product")
        .update({
          name,
          unit,
        })
        .eq("id", id),
      "/products",
      (x) => (loading = x)
    );
</script>

{#if product}
  <Card name={"Product - " + product.name}>
    <form method="post" on:submit|preventDefault={update}>
      <TextInput name="name" bind:value={name}>Name</TextInput>
      <TextInput name="unit" bind:value={unit}>Unit</TextInput>
      <SubmitButton>{loading ? "Saving ..." : "Update product"}</SubmitButton>
    </form>
  </Card>
{/if}
