<script lang="ts">
  import Navbar from "$lib/navbar/Navbar.svelte";
  import { getIsThemeDark } from "$lib/scripts/darkMode.js";
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
    isThemeDark = getIsThemeDark();
  });
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="flex flex-col">
  <Navbar bind:hideSidebar bind:isThemeDark />
  <div class="flex flex-row">
    {#if screenWidth > 768}
      <Sidebar {supabase} bind:hideSidebar bind:isThemeDark />
    {:else}
      <Drawer bind:hidden={hideSidebar} {transitionParams} transitionType="fly">
        <Sidebar {supabase} bind:hideSidebar bind:isThemeDark />
      </Drawer>
    {/if}
    <main class=" dark:bg-primary-900 overflow-auto bg-white">
      <slot />
    </main>
  </div>
</div>
