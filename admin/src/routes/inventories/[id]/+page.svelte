<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import type { Tables } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Button, Input, Label, Span } from "flowbite-svelte";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import { beforeNavigate, goto } from "$app/navigation";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";

  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);

  let loading = false;
  let unsavedChanges = false;
  let unsavedChangesModal = false;
  let confirmationModal = false;
  let navigateTo: URL | undefined = undefined;
  let inventory: Tables<"inventory"> | null = null;
  const id = $page.params.id;

  onMount(() =>
    genericGet(supabase.from("inventory").select().eq("id", id).single(), (x) => {
      inventory = x;
      name = inventory.name;
      date = inventory.date;
    })
  );

  beforeNavigate(({ cancel, to }) => {
    if (!unsavedChanges) {
      return;
    }
    cancel();
    unsavedChangesModal = true;
    navigateTo = to?.url;
    return;
  });

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
      { setLoading: (x) => (loading = x), onSuccess: "/inventories" }
    );

  const deleteInventory = () => {
    genericUpdate(supabase.from("inventory").delete().eq("id", id), { onSuccess: "/inventories" });
  };
  const deleteInventoryConfirmation = () => {
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

{#if inventory}
  <ScreenCard header={"Inventory - " + inventory.name} class="flex flex-col">
    <UnsavedWarningModal
      bind:open={unsavedChangesModal}
      onContinue={onUnsavedWarningContinue}
      onStay={() => (unsavedChangesModal = false)}
    />
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
        >{loading ? "Saving ..." : "Update inventory"}</Button
      >
    </form>
    <Button type="submit" class="w-fit self-end" color="red" on:click={deleteInventoryConfirmation}
      >Usuń tę inwentaryzację</Button
    >
  </ScreenCard>
{/if}
