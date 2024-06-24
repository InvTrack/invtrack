<script lang="ts">
  import { Heading } from "flowbite-svelte";
  export let header: string | undefined = "";
</script>

{#if header}
  <Heading tag="h2" class="px-8 py-4 text-gray-900 dark:text-white">{header}</Heading>
{/if}
<!-- remember to keep a space after the class string -->
<div class={"dark:bg-gray-800 bg-white rounded-lg mx-4 md:mx-8 p-8 " + $$props.class}>
  <slot />
</div>
