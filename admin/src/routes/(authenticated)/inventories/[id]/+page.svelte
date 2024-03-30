<script lang="ts">
  import { page } from "$app/stores";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Button, Input, Label, Span } from "flowbite-svelte";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";

  export let data;
  let { supabase, inventory } = data;
  $: ({ supabase } = data);
  $: name = inventory?.name;
  $: date = inventory?.date;

  let loading = false;
  let unsavedChanges = false;

  let confirmationModal = false;

  const id = $page.params.id;

  const update = () => {
    genericUpdate(
      supabase
        .from("inventory")
        .update({
          name,
          date,
        })
        .eq("id", id),
      { setLoading: (x) => (loading = x), onSuccess: "/inventories" }
    );
    unsavedChanges = false;
  };

  const deleteInventory = () => {
    genericUpdate(supabase.from("inventory").delete().eq("id", id), { onSuccess: "/inventories" });
  };
  const deleteInventoryConfirmation = () => {
    confirmationModal = true;
  };

  const onFormChange = () => {
    unsavedChanges = true;
  };
</script>

<ScreenCard header={"Inwentaryzacja - " + inventory.name} class="flex flex-col">
  <UnsavedWarningModal bind:unsavedChanges />
  <ConfirmationModal
    bind:open={confirmationModal}
    message="Czy na pewno chcesz usunąć tę inwentaryzację?"
    onConfirm={deleteInventory}
  />

  <form on:submit|preventDefault={update} on:change={onFormChange} class="flex-1">
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" placeholder="Name" bind:value={name} />
    </Label>
    <Label class="space-y-2 mt-2">
      <Span>Data</Span>
      <Input type="text" name="date" placeholder="Date" bind:value={date} />
    </Label>
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie ..." : "Aktualizuj inwentaryzację"}</Button
    >
  </form>
  <Button type="submit" class="w-fit self-end" color="red" on:click={deleteInventoryConfirmation}
    >Usuń tę inwentaryzację</Button
  >
</ScreenCard>
