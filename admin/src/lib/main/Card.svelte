<script lang="ts">
  export let name: string;
</script>

<h1 class="ml-10 mt-10 text-4xl dark:text-white">{name}</h1>
<div class="mx-10 my-10 px-10 py-10 border bg-white rounded-lg shadow">
  <slot />
</div>
