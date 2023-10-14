<script lang="ts">
  import { Heading } from "flowbite-svelte";
  export let header: string | undefined = "";
</script>
{#if !header}
<div class={"dark:bg-gray-800 bg-white rounded-lg mx-8 mt-4 p-8 " + $$props.class}>
  <slot />
</div>
{:else}
<Heading tag="h2" class="px-8 pt-4 text-gray-900 dark:text-white">{header}</Heading>
<!-- remember to keep a space after the class string -->
<div class={"dark:bg-gray-800 bg-white rounded-lg mx-8 mt-4 p-8 " + $$props.class}>
  <slot />
</div>

{/if}
