<script>
  import { Navbar, NavHamburger, NavBrand } from "flowbite-svelte";
  import logo_dark from "$lib/assets/logo-dark.png";
  import logo_light from "$lib/assets/logo-light.png";
  let isThemeDark = true;
  export let hideSidebar = true;
  const toggleSidebar = () => {
    hideSidebar = !hideSidebar;
  };
</script>

<Navbar class="md:hidden">
  <NavHamburger on:click={() => toggleSidebar()} />
  <NavBrand href="/" class="w-1/3 place-self-center">
    {#if isThemeDark}
      <img src={logo_dark} alt="InvTrack" />
    {:else}
      <img src={logo_light} alt="InvTrack" />
    {/if}
  </NavBrand>
  <div />
</Navbar>
