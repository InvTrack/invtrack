<script lang="ts">
  import { Heading } from "flowbite-svelte";
  export let header: string | undefined = "";
</script>

<Heading tag="h2" class="px-8 pt-4 text-gray-900 dark:text-gray-400">{header}</Heading>
<div class={"px-8 dark:bg-gray-800 bg-white rounded-lg mx-8 mt-4 p-8 " + $$props.class}>
  <slot />
</div>
