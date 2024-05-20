<script lang="ts">
  import { page } from "$app/stores";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import { currentCompanyId } from "$lib/store";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import Parts from "../Parts.svelte";
  import RecipeNameAliases from "./RecipeNameAliases.svelte";

  export let data;
  let { supabase, recipe, products } = data;
  $: ({ supabase } = data);
  $: name = recipe.name;

  let company_id: number;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  let loading = false;
  let unsavedChanges = false;

  let confirmationModal = false;
  const id = $page.params.id;

  let partsRef: Parts;
  let parts = recipe.recipe_part;

  let recipeNameAliasesRef: RecipeNameAliases;
  let aliases: string[] = recipe.name_alias.map((a) => a.alias);

  const update = async () => {
    // TODO - handle error when request fails
    genericUpdate(
      supabase
        .from("recipe")
        .update({
          name,
        })
        .eq("id", id),
      { setLoading: (x) => (loading = x), onSuccess: "/recipes" }
    );
    partsRef.submit(supabase, (x) => (loading = x), recipe.id);
    recipeNameAliasesRef.submit(supabase, (x) => (loading = x), company_id, recipe.id);

    unsavedChanges = false;
  };

  const onFormChange = () => {
    if (partsRef && (partsRef.selectedProductId || partsRef.quantity)) {
      unsavedChanges = false;
      return;
    }
    unsavedChanges = true;
  };

  const deleteEntity = () => {
    genericUpdate(supabase.from("recipe").delete().eq("id", recipe.id), {
      onSuccess: "/recipes",
    });
  };
  const deleteProductConfirmation = () => (confirmationModal = true);
</script>

<ScreenCard header={"Receptura - " + recipe.name} class="flex flex-col">
  <UnsavedWarningModal bind:unsavedChanges />
  <ConfirmationModal
    bind:open={confirmationModal}
    message="Czy na pewno chcesz usunąć tą recepturę?"
    onConfirm={deleteEntity}
  />
  <form on:submit|preventDefault={update} on:change={onFormChange} class="flex-1">
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" required bind:value={name} />
    </Label>
    <Parts bind:this={partsRef} bind:unsavedChanges bind:parts bind:products />
    <RecipeNameAliases bind:this={recipeNameAliasesRef} bind:aliases bind:unsavedChanges />
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie..." : "Aktualizuj recepturę"}</Button
    >
  </form>
  <Button type="submit" class="w-fit self-end" color="red" on:click={deleteProductConfirmation}
    >Usuń tą recepturę</Button
  >
</ScreenCard>
