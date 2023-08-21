<script lang="ts">
  export let name: string;
  export let value: string | undefined | null;
</script>

<div class="mb-6">
  <label for="unit" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    ><slot /></label
  >
  <input
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    required
    type="text"
    id={name}
    {name}
    bind:value
  />
</div>
