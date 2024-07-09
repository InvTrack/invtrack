<script lang="ts">
  import Navbar from "$lib/navbar/Navbar.svelte";
  import { getTheme } from "$lib/scripts/darkMode.js";
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import { Drawer } from "flowbite-svelte";
  import { onMount } from "svelte";
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
  let isThemeDark: boolean;
  onMount(() => {
    screenWidth = window.innerWidth;
    isThemeDark = getTheme() === "dark";
  });
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="flex h-fit min-h-screen flex-col">
  <Navbar bind:hideSidebar bind:isThemeDark />
  <div class="dark:bg-primary-900 flex h-fit min-h-screen flex-row bg-white">
    {#if screenWidth > 768}
      <Sidebar {supabase} bind:hideSidebar bind:isThemeDark />
    {:else}
      <Drawer
        bind:hidden={hideSidebar}
        {transitionParams}
        transitionType="fly"
        class="m-0 w-72 p-0"
      >
        <Sidebar {supabase} bind:hideSidebar bind:isThemeDark />
      </Drawer>
    {/if}
    <main class="dark:bg-primary-900 w-full overflow-auto bg-white mb-16">
      <slot />
    </main>
  </div>
</div>
