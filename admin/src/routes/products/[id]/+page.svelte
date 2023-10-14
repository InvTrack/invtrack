<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";

  let loading = false;
  let product: Tables<"product"> | null = null;
  const id = $page.params.id;
  onMount(() =>
    genericGet(supabase.from("product").select().eq("id", id).single(), (x) => {
      product = x;
      name = product.name;
      unit = product.unit;
      steps = product.steps;
    })
  );

  let name: string | undefined = undefined;
  let unit: string | undefined = undefined;
  let steps: number[] = [];

  const update = () =>
    genericUpdate(
      supabase
        .from("product")
        .update({
          name,
          unit,
          steps,
        })
        .eq("id", id),
      "/products",
      (x) => (loading = x)
    );
</script>

{#if product}
  <ScreenCard header={"Product - " + product.name}>
    <form on:submit|preventDefault={update}>
      <Label class="space-y-2">
        <Span>Nazwa</Span>
        <Input type="text" name="name" required bind:value={name} />
      </Label>
      <Label class="space-y-2 mt-2">
        <Span>Jednostka</Span>
        <Input type="text" name="unit" required bind:value={unit} />
      </Label>
      <Label class="space-y-2 mt-2">
        <Span>Step</Span>
        <div class="flex flex-row gap-4">
          <Input type="text" name="steps" required bind:value={steps[0]} />
          <Input type="text" name="steps" required bind:value={steps[1]} />
          <Input type="text" name="steps" required bind:value={steps[2]} />
        </div>
      </Label>
      <Button type="submit" class="mt-4" color="primary"
        >{loading ? "Saving ..." : "Update product"}</Button
      >
    </form>
  </ScreenCard>
{/if}
