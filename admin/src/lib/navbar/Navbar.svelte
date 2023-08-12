<script>
  import HomeIcon from "$lib/navbar/icons/HomeIcon.svelte";
  import UsersIcon from "$lib/navbar/icons/UsersIcon.svelte";
  import { supabase } from "$lib/supabase";
  import NavbarItem from "./NavbarItem.svelte";
  import ListIcon from "./icons/ListIcon.svelte";
  import ProductIcon from "./icons/ProductIcon.svelte";
  const handleLogout = () => supabase.auth.signOut();
</script>

<nav
  id="default-sidebar"
  class="w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
  aria-label="Sidebar"
>
  <div class="h-full flex flex-col px-3 py-4 overflow-y-auto bg-gray-800">
    <ul class="flex-1 space-y-2 font-medium">
      <NavbarItem path="/">
        <HomeIcon />
        <span class="flex-1 ml-3">Dashboard</span>
      </NavbarItem>
      <NavbarItem path="/workers">
        <UsersIcon />
        <span class="flex-1 ml-3 whitespace-nowrap">Workers</span>
      </NavbarItem>
      <NavbarItem path="/inventories">
        <ListIcon />
        <span class="flex-1 ml-3 whitespace-nowrap">Inventories</span>
      </NavbarItem>
      <NavbarItem path="/products">
        <ProductIcon />
        <span class="flex-1 ml-3 whitespace-nowrap">Products</span>
      </NavbarItem>
    </ul>
    <button
      class="w-full flex items-center justify-start p-2 rounded-lg text-white hover:bg-gray-700 group"
      on:click={handleLogout}
    >
      <span class="flex-1 whitespace-nowrap">Logout</span>
    </button>
  </div>
</nav>
