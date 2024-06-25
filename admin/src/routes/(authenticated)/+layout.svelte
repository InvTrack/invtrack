<script lang="ts">
  import Navbar from "$lib/navbar/Navbar.svelte";
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import { Drawer } from "flowbite-svelte";
  import { sineIn } from "svelte/easing";

  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);

  let hideSidebar: boolean = true;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
  let screenWidth: number;
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="flex h-fit min-h-screen flex-col">
  <Navbar bind:hideSidebar />
  <div class="dark:bg-primary-900 flex h-fit min-h-screen flex-row bg-white">
    {#if screenWidth > 768}
      <Sidebar {supabase} bind:hideSidebar />
    {:else}
      <Drawer bind:hidden={hideSidebar} {transitionParams} transitionType="fly">
        <Sidebar {supabase} bind:hideSidebar />
      </Drawer>
    {/if}
    <main class="dark:bg-primary-900 w-fit overflow-auto bg-white">
      <slot />
    </main>
  </div>
</div>
