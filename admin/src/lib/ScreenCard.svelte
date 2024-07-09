<script lang="ts">
  import { Heading } from "flowbite-svelte";
  export let header: string | undefined = "";
</script>

{#if header}
  <Heading tag="h2" class="px-8 py-4 text-gray-900 dark:text-white">{header}</Heading>
{/if}
<!-- remember to keep a space after the class string -->
<div class={"bg-primary-50 mx-4 rounded-lg p-8  md:mx-8 dark:bg-gray-800 " + $$props.class}>
  <slot />
</div>
