<script lang="ts">
  import { Button, Modal } from "flowbite-svelte";
  import { ExclamationCircleOutline } from "flowbite-svelte-icons";

  export let open = false;
  export let message = "";
  export let onConfirm: () => void = () => {};
  export let onCancel: () => void = () => {};
  export let confirmText: string | undefined = undefined;
  export let cancelText: string | undefined = undefined;
</script>

<Modal bind:open size="xs" outsideclose>
  <div class="text-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
      {message}
    </h3>
    {#if cancelText}
      <Button color="red" class="me-2" on:click={onCancel}>{cancelText}</Button>
    {/if}
    {#if confirmText}
      <Button color="alternative" on:click={onConfirm}>{confirmText}</Button>
    {/if}
  </div>
</Modal>
