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
  import {
    BriefcaseSolid,
    HomeSolid,
    ListSolid,
    MoonSolid,
    SunSolid,
    UsersSolid,
  } from "flowbite-svelte-icons";

  const handleLogout = () => supabase.auth.signOut();
  $: isThemeDark = getIsThemeDark();
  $: activeUrl = $page.url.pathname;
</script>

<Sidebar
  {activeUrl}
  class="h-screen sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 w-72 min-w-[18rem]"
>
  <SidebarWrapper>
    <SidebarGroup>
      <SidebarItem label="Podsumowanie" href="/">
        <svelte:fragment slot="icon">
          <HomeSolid
            active={activeUrl === "/"}
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Pracownicy" href="/workers">
        <svelte:fragment slot="icon">
          <UsersSolid
            active={activeUrl === "/workers"}
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Inwentaryzacje" href="/inventories">
        <svelte:fragment slot="icon">
          <ListSolid
            active={activeUrl === "/inventories"}
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Produkty" href="/products">
        <svelte:fragment slot="icon">
          <BriefcaseSolid
            active={activeUrl === "/products"}
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          /></svelte:fragment
        >
      </SidebarItem>
    </SidebarGroup>
    <SidebarGroup border>
      <SidebarDropdownWrapper label="Twoje konto">
        <svelte:fragment slot="icon">
          <UsersSolid
            class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <SidebarDropdownItem label="Wyloguj" on:click={handleLogout} />
      </SidebarDropdownWrapper>
    </SidebarGroup>
    <SidebarGroup class="absolute bottom-24 flex flex-col mt-8">
      <h3 class="w-full text-base font-normal text-gray-900 rounded-lg dark:text-white">
        Zmień motyw
      </h3>
      <div class="flex flex-row">
        <SunSolid class="w-6 h-6 text-gray-500 dark:text-gray-400 mr-2" />
        <Toggle checked={isThemeDark} on:click={toggleDarkMode} />
        <MoonSolid class="w-6 h-6 text-gray-500 dark:text-gray-400" />
      </div>
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
