<script lang="ts">
  import { beforeNavigate, goto } from "$app/navigation";
  import { Button, Modal } from "flowbite-svelte";
  import { ExclamationCircleOutline } from "flowbite-svelte-icons";

  export let unsavedChanges: boolean;
  let navigateTo: URL | undefined = undefined;
  let open: boolean;

  const onStay: () => void = () => (open = false);
  const onContinue: () => void = () => {
    unsavedChanges = false;
    open = false;
    if (navigateTo) {
      goto(navigateTo);
    }
  };

  beforeNavigate(({ cancel, to }) => {
    if (!unsavedChanges) {
      return;
    }
    cancel();
    open = true;
    navigateTo = to?.url;
    return;
  });
</script>

<Modal bind:open size="xs" outsideclose>
  <div class="text-center">
    <ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
      Uwaga, zmiany nie zostały zapisane!
    </h3>
    <Button color="red" class="me-2" on:click={onContinue}>Kontynuuj</Button>
    <Button color="alternative" on:click={onStay}>Zostań na stronie</Button>
  </div>
</Modal>
