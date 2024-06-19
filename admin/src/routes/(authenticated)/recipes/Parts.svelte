<svelte:options accessors />

<script lang="ts">
  import { genericUpdate } from "$lib/genericUpdate";
  import type { PatchedDatabase, Tables } from "$lib/helpers";
  import ErrorModal from "$lib/modals/ErrorModal.svelte";
  import type { SupabaseClient } from "@supabase/supabase-js";
  import {
    Button,
    ButtonGroup,
    Input,
    InputAddon,
    Select,
    Span,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
  } from "flowbite-svelte";
  import { CloseCircleSolid } from "flowbite-svelte-icons";

  type Part = { id?: number; quantity: number; product_id: number };

  export let unsavedChanges: boolean;
  export let parts: Part[];
  export let products: Tables<"product">[];
  let newParts: Part[] = [];
  let deleteParts: Part[] = [];

  let partErrorModal = false;

  $: productItems = products
    .map((p) => ({ name: p.name, value: p.id }))
    .filter(
      (p) =>
        !newParts.find((newPart) => newPart.product_id === p.value) ||
        deleteParts.find((deletedPart) => deletedPart.product_id === p.value)
    );
  export let selectedProductId = null as number | null;
  export let quantity = null as number | null;
  $: product = products.find((p) => p.id === selectedProductId);
  export const addPart = () => {
    if (!quantity || !selectedProductId) return;
    if (
      parts.find((part) => part.product_id === selectedProductId) ||
      newParts.find((newPart) => newPart.product_id === selectedProductId)
    ) {
      partErrorModal = true;
      return;
    }
    const newPart: Part = { product_id: selectedProductId, quantity };
    parts = [...parts, newPart];
    newParts = [...newParts, newPart];
    quantity = null;
    selectedProductId = null;
    unsavedChanges = true;
  };

  const deletePart = (partToDelete: Part) => {
    unsavedChanges = true;
    deleteParts = [...deleteParts, partToDelete];
    newParts = newParts.filter((newPart) => newPart.product_id !== partToDelete.product_id);
    parts = parts.filter((part) => part.product_id !== partToDelete.product_id);
  };

  export const submit = (
    supabase: SupabaseClient<PatchedDatabase>,
    setLoading: (x: boolean) => void,
    recipe_id: number
  ) => {
    if (deleteParts) {
      deleteParts.forEach(
        ({ id }) =>
          id &&
          genericUpdate(supabase.from("recipe_part").delete().match({ id }), {
            setLoading,
          })
      );
      if (newParts) {
        newParts.forEach(({ product_id, quantity }) => {
          genericUpdate(supabase.from("recipe_part").insert({ recipe_id, quantity, product_id }), {
            setLoading,
            onError: () => (partErrorModal = true),
          });
        });
        // TODO - handle error when request fails
        newParts = [];
      }
      // TODO - handle error when request fails
      deleteParts = [];
    }
  };
</script>

<div class="space-y-2 mt-2">
  <ErrorModal
    open={partErrorModal}
    message="Nie udało się dodać składnika - ten produkt już istnieje w tej recepturze"
    confirmText="OK"
    onConfirm={() => (partErrorModal = false)}
  />
  <Span>Składniki</Span>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 place-items-start gap-4">
      <div class="col-span-2 flex gap-4 w-full">
        <Select items={productItems} bind:value={selectedProductId} placeholder="Produkt" />
        <ButtonGroup class="w-full" size="lg">
          <Input
            type="text"
            name="steps"
            placeholder="Ilość"
            class="h-min w-full"
            bind:value={quantity}
          />
          {#if product}<InputAddon>{product.unit}</InputAddon>{/if}
        </ButtonGroup>
        <Button color="primary" class="shrink-0" on:click={addPart}>Dodaj składnik</Button>
      </div>
      <Table>
        <TableBody>
          {#each parts as part}
            <TableBodyRow>
              <TableBodyCell>
                {products.find((p) => p.id === part.product_id)?.name}
              </TableBodyCell>
              <TableBodyCell>
                {part.quantity}
                {products.find((p) => p.id === part.product_id)?.unit}
              </TableBodyCell>
              <TableBodyCell>
                <CloseCircleSolid on:click={() => deletePart(part)} />
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>
    </div>
  </div>
</div>
