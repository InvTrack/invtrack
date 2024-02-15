<script lang="ts">
  import Sidebar from "$lib/sidebar/Sidebar.svelte";

  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);
</script>

<div class="flex flex-row">
  <Sidebar {supabase} />
  <main class="flex-1 bg-white dark:bg-primary-900">
    <slot />
  </main>
</div>
