<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import { CloseCircleSolid } from "flowbite-svelte-icons";

  let loading = false;
  let product: Tables<"product"> | null = null;
  const id = $page.params.id;
  onMount(() =>
    genericGet(supabase.from("product").select().eq("id", id).single(), (x) => {
      product = x;
      name = product.name;
      unit = product.unit;
      steps = product.steps;
      barcodes = product.barcodes ?? [];
    })
  );

  let name: string | undefined = undefined;
  let unit: string | undefined = undefined;
  let steps: number[] = [];
  let barcodes: string[] = [];
  let newBarcode: string | null = null;

  const addBarcode = () => {
    if (!newBarcode) return;
    barcodes = [...barcodes, newBarcode];
    newBarcode = null;
  };

  const update = () =>
    genericUpdate(
      supabase
        .from("product")
        .update({
          name,
          unit,
          steps,
          barcodes: barcodes?.concat(newBarcode ?? []),
        })
        .eq("id", id),
      undefined,
      (x) => (loading = x)
    );
</script>

{#if product}
  <ScreenCard header={"Produkt - " + product.name}>
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
      <div class="space-y-2 mt-2">
        <Span>Kody</Span>
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 place-items-start gap-4">
            <div class="col-span-2 flex gap-4 w-full">
              <Input
                type="text"
                name="steps"
                placeholder="Dodaj nowy kod"
                class="h-min w-full"
                bind:value={newBarcode}
              />
              <Button type="submit" color="primary" class="shrink-0" on:click={addBarcode}
                >Dodaj kod</Button
              >
            </div>
            {#each barcodes as _barcode, i}
              <Input type="text" name="steps" class="h-fit" required bind:value={barcodes[i]}>
                <CloseCircleSolid
                  slot="right"
                  on:click={() => (barcodes = barcodes.filter((_, j) => i !== j))}
                />
              </Input>
            {/each}
          </div>
        </div>
      </div>
      <Button type="submit" class="mt-4" color="primary"
        >{loading ? "Saving ..." : "Aktualizuj produkt"}</Button
      >
    </form>
  </ScreenCard>
{/if}
