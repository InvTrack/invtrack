<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button, Checkbox } from "flowbite-svelte";
  import { beforeNavigate, goto } from "$app/navigation";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";

  let loading = false;
  let unsavedChanges = false;
  let unsavedChangesModal = false;
  let navigateTo: URL | undefined = undefined;
  let worker: Tables<"worker"> | null = null;
  const id = $page.params.id;
  onMount(() =>
    genericGet(supabase.from("worker").select().eq("id", id).single(), (x) => {
      worker = x;
      name = worker.name;
      is_admin = worker.is_admin;
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

  let name: string | undefined | null = undefined;
  let is_admin: boolean | undefined = true;

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

{#if worker}
  <ScreenCard header={"Worker - " + worker.name}>
    <UnsavedWarningModal
      bind:open={unsavedChangesModal}
      onContinue={onUnsavedWarningContinue}
      onStay={() => (unsavedChangesModal = false)}
    />
    <form on:submit|preventDefault={update} on:change={onFormChange}>
      <Label class="space-y-2">
        <Span>Nazwa</Span>
        <Input type="text" name="name" placeholder="•••••" required bind:value={name} />
      </Label>
      <Label class="space-y-2 mt-2">
        <Span>Admin</Span>
        <Checkbox name="admin" bind:checked={is_admin} />
      </Label>
      <Button type="submit" class="mt-4" color="primary"
        >{loading ? "Saving ..." : "Update worker"}</Button
      >
    </form>
  </ScreenCard>
{/if}
