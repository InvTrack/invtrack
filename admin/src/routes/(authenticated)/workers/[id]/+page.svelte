<script lang="ts">
  import { page } from "$app/stores";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button, Checkbox } from "flowbite-svelte";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";

  export let data;
  let { supabase, worker } = data;
  $: ({ supabase } = data);
  $: name = worker.name;
  $: is_admin = worker.is_admin;

  let loading = false;
  let unsavedChanges = false;

  const id = $page.params.id;

  const update = () =>
    genericUpdate(
      supabase
        .from("worker")
        .update({
          name,
          is_admin,
        })
        .eq("id", id),
      { onSuccess: "/workers", setLoading: (x) => (loading = x) }
    );

  const onFormChange = () => {
    unsavedChanges = true;
  };
</script>

<ScreenCard header={"Pracownik - " + worker.name}>
  <UnsavedWarningModal bind:unsavedChanges />
  <form on:submit|preventDefault={update} on:change={onFormChange}>
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" required bind:value={name} />
    </Label>
    <Label class="mt-2 space-y-2">
      <Span>Admin</Span>
      <Checkbox name="admin" bind:checked={is_admin} />
    </Label>
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Ładowanie ..." : "Aktualizuj pracownika"}</Button
    >
  </form>
</ScreenCard>
