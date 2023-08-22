<script>
  import HomeIcon from "$lib/navbar/icons/HomeIcon.svelte";
  import UsersIcon from "$lib/navbar/icons/UsersIcon.svelte";

  import ListIcon from "./icons/ListIcon.svelte";
  import ProductIcon from "./icons/ProductIcon.svelte";

  import { page } from "$app/stores";
  import { Section, SidebarBottomNav, SidebarBottomNavItem } from "flowbite-svelte-blocks";
  import {
    Button,
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
    Toggle,
  } from "flowbite-svelte";
  import { supabase } from "$lib/supabase";
  const handleLogout = () => supabase.auth.signOut();
  let spanClass = "flex-1 ml-3 whitespace-nowrap";
</script>

<Section name="tableheader" sectionClass="bg-gray-50 dark:bg-gray-900 flex h-full py-4">
  <Sidebar>
    <SidebarWrapper class="bg-white">
      <SidebarGroup>
        <SidebarItem label="Dashboard" href="/">
          <svelte:fragment slot="icon">
            <HomeIcon twStyle="w-6 h-6 text-gray-400 dark:text-gray-400" />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Workers" href="/workers">
          <svelte:fragment slot="icon">
            <UsersIcon twStyle="w-6 h-6 text-gray-400 dark:text-gray-400" />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Inventories" href="/inventories">
          <svelte:fragment slot="icon">
            <ListIcon twStyle="w-6 h-6 text-gray-400 dark:text-gray-400" />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Products" href="/products" {spanClass}>
          <svelte:fragment slot="icon">
            <ProductIcon twStyle="w-6 h-6 text-gray-400 dark:text-gray-400" />
          </svelte:fragment>
        </SidebarItem>
        <SidebarDropdownWrapper label="Authentication">
          <svelte:fragment slot="icon">
            <svg
              aria-hidden="true"
              class="w-6 h-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              /></svg
            >
          </svelte:fragment>
          <SidebarDropdownItem label="Sign out" on:click={handleLogout} />
          <SidebarDropdownItem label="Forgot Password" href="/" />
        </SidebarDropdownWrapper>
      </SidebarGroup>

      <SidebarGroup class="relative pt-64" border>
        <SidebarBottomNav>
          <Button
            on:click={() => {
              window.document.body.classList.toggle("dark");
              console.log(window.document.body.classList);
            }}
          >
            <SidebarBottomNavItem>
              Darkmode <Toggle />
            </SidebarBottomNavItem>
          </Button>
        </SidebarBottomNav>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Section>
