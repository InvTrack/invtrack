<script lang="ts">
  import Navbar from "$lib/navbar/Navbar.svelte";
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import { Drawer } from "flowbite-svelte";
  import { sineIn } from "svelte/easing";

  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);

  let hideSidebar: boolean;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
  let screenWidth: number;
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="flex flex-col">
  <Navbar bind:hideSidebar />
  <div class="flex flex-row">
    {#if screenWidth > 768}
      <Sidebar {supabase} />
    {:else}
      <Drawer bind:hidden={hideSidebar} {transitionParams} transitionType="fly">
        <Sidebar {supabase} />
      </Drawer>
    {/if}
    <main class=" bg-white dark:bg-primary-900">
      <slot />
    </main>
  </div>
</div>
