<script>
  import { page } from "$app/stores";
  import { getIsThemeDark, toggleDarkMode } from "$lib/scripts/darkMode";
  import { supabase } from "$lib/supabase";
  import {
    Sidebar,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    Toggle,
  } from "flowbite-svelte";
  import { Icon } from "flowbite-svelte-icons";

  const handleLogout = () => supabase.auth.signOut();
  $: isThemeDark = getIsThemeDark();
  $: activeUrl = $page.url.pathname;
</script>

<Sidebar {activeUrl} class="h-screen bg-gray-50 dark:bg-gray-800 px-4">
  <SidebarWrapper>
    <SidebarGroup>
      <SidebarItem label="Overview" href="/">
        <svelte:fragment slot="icon">
          <Icon
            active={activeUrl === "/"}
            name="home-solid"
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Workers" href="/workers">
        <svelte:fragment slot="icon">
          <Icon
            active={activeUrl === "/"}
            name="users-solid"
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Inventories" href="/inventories">
        <svelte:fragment slot="icon">
          <Icon
            active={activeUrl === "/"}
            name="list-solid"
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Products" href="/products">
        <svelte:fragment slot="icon">
          <Icon
            active={activeUrl === "/"}
            name="briefcase-solid"
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          /></svelte:fragment
        >
      </SidebarItem>
    </SidebarGroup>
    <SidebarGroup border>
      <SidebarDropdownWrapper label="Account">
        <svelte:fragment slot="icon">
          <Icon
            name="user-solid"
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <SidebarDropdownItem label="Sign out" on:click={handleLogout} />
      </SidebarDropdownWrapper>
    </SidebarGroup>
    <SidebarGroup class="absolute bottom-24 flex flex-col mt-8">
      <h3 class="w-full text-base font-normal text-gray-900 rounded-lg dark:text-white">
        Toggle theme
      </h3>
      <div class="flex flex-row">
        <Icon name="sun-solid" class="w-6 h-6 text-gray-500 dark:text-gray-400 mr-2" />
        <Toggle checked={isThemeDark} on:click={toggleDarkMode} />
        <Icon name="moon-solid" class="w-6 h-6 text-gray-500 dark:text-gray-400" />
      </div>
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
