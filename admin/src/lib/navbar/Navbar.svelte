<script lang="ts">
  import { Navbar, NavHamburger, NavBrand } from "flowbite-svelte";
  import logo_dark from "$lib/assets/logo-dark.png";
  import logo_light from "$lib/assets/logo-light.png";

  export let isThemeDark: boolean;
  export let hideSidebar: boolean;
  const toggleSidebar = () => {
    hideSidebar = !hideSidebar;
  };
</script>

<Navbar class="bg-primary-50 sticky top-0 z-10 shadow-md md:hidden dark:bg-gray-800">
  <NavHamburger on:click={() => toggleSidebar()} class="absolute  my-auto" />
  <NavBrand href="/" class=" mx-auto mb-4 w-32">
    {#if isThemeDark}
      <img src={logo_dark} alt="InvTrack" />
    {:else}
      <img src={logo_light} alt="InvTrack" />
    {/if}
  </NavBrand>
</Navbar>
