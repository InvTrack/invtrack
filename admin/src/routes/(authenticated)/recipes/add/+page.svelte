<script lang="ts">
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import { currentCompanyId } from "$lib/store";
  import Parts from "../Parts.svelte";
  import type { Tables } from "$lib/helpers";
  import { goto } from "$app/navigation";

  export let data;
  let { supabase, products } = data;
  $: ({ supabase } = data);
  $: name = "";

  let company_id: number;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  let loading = false;
  let unsavedChanges = false;

  let partsRef: Parts;
  let parts: Tables<"recipe_part">[] = [];

  const update = async () => {
    unsavedChanges = false;
    loading = true;
    const { data, error } = await supabase
      .from("recipe")
      .insert({
        name,
        company_id,
      })
      .select()
      .single();
    data && partsRef.submit(supabase, (x) => (loading = x), data.id);
    !error && goto("/recipes");
    loading = false;
  };

  const onFormChange = () => {
    if (partsRef && (partsRef.selectedProductId || partsRef.quantity)) {
      unsavedChanges = false;
      return;
    }
    unsavedChanges = true;
  };
</script>

<ScreenCard header={"Dodaj nową recetpturę"} class="flex flex-col">
  <UnsavedWarningModal bind:unsavedChanges />
  <form on:submit|preventDefault={update} on:change={onFormChange} class="flex-1">
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" required bind:value={name} />
    </Label>
    <Parts bind:this={partsRef} bind:unsavedChanges bind:parts bind:products />
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie..." : "Dodaj recepturę"}</Button
    >
  </form>
</ScreenCard>
