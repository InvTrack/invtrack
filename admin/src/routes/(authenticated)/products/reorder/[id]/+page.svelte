<script lang="ts">
  import { beforeNavigate, goto } from "$app/navigation";
  import type { Tables } from "$lib/helpers";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import { currentCompanyId } from "$lib/store";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";

  export let data;
  let { supabase, category } = data;
  $: ({ supabase } = data);

  let navigateTo: URL | undefined = undefined;
  let loading = false;
  let unsavedChanges = false;
  let unsavedChangesModal = false;
  let confirmationModal = false;

  let company_id: number | null;
  let name: Tables<"product_category">["name"] = category.name;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  beforeNavigate(({ cancel, to }) => {
    if (!unsavedChanges) {
      return;
    }
    cancel();
    unsavedChangesModal = true;
    navigateTo = to?.url;
    return;
  });

  const update = async () => {
    // TODO - handle error when request fails
    genericUpdate(
      supabase
        .from("product_category")
        .update({
          name,
        })
        .eq("id", category.id),
      { setLoading: (x) => (loading = x), onSuccess: "/products/reorder" }
    );
    unsavedChanges = false;
  };

  const deleteCategory = () => {
    genericUpdate(supabase.from("product_category").delete().eq("id", category.id), {
      onSuccess: "/products/reorder",
    });
  };
  const deleteCategoryConfirmation = () => {
    confirmationModal = true;
  };

  const onUnsavedWarningContinue = () => {
    unsavedChanges = false;
    unsavedChangesModal = false;
    if (navigateTo) {
      goto(navigateTo);
    }
  };

  const onFormChange = () => {
    unsavedChanges = true;
  };
</script>

<ScreenCard header={"Kategoria - " + category.name}>
  <UnsavedWarningModal
    bind:open={unsavedChangesModal}
    onContinue={onUnsavedWarningContinue}
    onStay={() => (unsavedChangesModal = false)}
  />
  <ConfirmationModal
    bind:open={confirmationModal}
    message="Czy na pewno chcesz usunąć tą kategorię?"
    onConfirm={deleteCategory}
  />
  <form on:submit|preventDefault={update} on:change={onFormChange}>
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" required bind:value={name} />
    </Label>
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie..." : "Zapisz kategorię"}</Button
    >
  </form>
  <Button type="submit" class="w-fit self-end" color="red" on:click={deleteCategoryConfirmation}
    >Usuń tą kategorię</Button
  >
</ScreenCard>
