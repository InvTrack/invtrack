<script lang="ts">
  import { Button, Modal } from "flowbite-svelte";
  import { ExclamationCircleOutline } from "flowbite-svelte-icons";

  export let open = false;
  export let onContinue: () => void;
  export let onStay: () => void;

  // const onUnsavedWarningContinue = () => {
  //   unsavedChanges = false;
  //   unsavedChangesModal = false;
  //   if (navigateTo) {
  //     goto(navigateTo);
  //   }
  // };
</script>

<Modal bind:open size="xs" outsideclose>
  <div class="text-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
      Uwaga, zmiany nie zostały zapisane!
    </h3>
    <Button color="red" class="me-2" on:click={onContinue}>Kontynuuj</Button>
    <Button color="alternative" on:click={onStay}>Zostań na stronie</Button>
  </div>
</Modal>
