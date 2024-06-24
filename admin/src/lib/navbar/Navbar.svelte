<script lang="ts">
  import { Navbar, NavHamburger, NavBrand } from "flowbite-svelte";
  import logo_dark from "$lib/assets/logo-dark.png";
  import logo_light from "$lib/assets/logo-light.png";
  let isThemeDark = true;

  export let hideSidebar: boolean;
  const toggleSidebar = () => {
    hideSidebar = !hideSidebar;
  };
</script>

<Navbar class="md:hidden fixed z-10">
  <NavHamburger on:click={() => toggleSidebar()} class="absolute  my-auto" />
  <NavBrand href="/" class=" w-32 mx-auto mb-4">
    {#if isThemeDark}
      <img src={logo_dark} alt="InvTrack" />
    {:else}
      <img src={logo_light} alt="InvTrack" />
    {/if}
  </NavBrand>
</Navbar>
