<script lang="ts">
  import { page } from "$app/stores";
  import { beforeNavigate, goto } from "$app/navigation";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import { CloseCircleSolid } from "flowbite-svelte-icons";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import ErrorModal from "$lib/modals/ErrorModal.svelte";
  import { currentCompanyId } from "$lib/store";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";

  export let data;
  let { supabase, recipe } = data;
  $: ({ supabase } = data);
  $: name = recipe.name;

  let company_id: number;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  let navigateTo: URL | undefined = undefined;
  let loading = false;
  let unsavedChanges = false;
  let unsavedChangesModal = false;
  let confirmationModal = false;
  const id = $page.params.id;

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
        .from("recipe")
        .update({
          name,
        })
        .eq("id", id),
      { setLoading: (x) => (loading = x), onSuccess: "/recipes" }
    );
    unsavedChanges = false;
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

  const deleteEntity = () => {
    // genericUpdate(
    //   supabase.from("product").update({ deleted_at: new Date().toISOString() }).eq("id", id),
    //   {
    //     onSuccess: "/products",
    //   }
    // );
  };
  const deleteProductConfirmation = () => (confirmationModal = true);
</script>

<ScreenCard header={"Receptura - " + recipe.name} class="flex flex-col">
  <UnsavedWarningModal
    bind:open={unsavedChangesModal}
    onContinue={onUnsavedWarningContinue}
    onStay={() => (unsavedChangesModal = false)}
  />
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
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie..." : "Aktualizuj recepturę"}</Button
    >
  </form>
  <Button type="submit" class="w-fit self-end" color="red" on:click={deleteProductConfirmation}
    >Usuń tą recepturę</Button
  >
</ScreenCard>
