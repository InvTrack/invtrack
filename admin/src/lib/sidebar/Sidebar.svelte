<script lang="ts">
  import { page } from "$app/stores";
  import { reloadTheme, toggleDarkMode } from "$lib/scripts/darkMode";
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
    BellActiveAltSolid,
    BriefcaseSolid,
    HomeSolid,
    InboxFullSolid,
    ListSolid,
    MoonSolid,
    SunSolid,
    UsersSolid,
  } from "flowbite-svelte-icons";
  import logo_dark from "$lib/assets/logo-dark.png";
  import logo_light from "$lib/assets/logo-light.png";
  import NotificationCenterModal from "$lib/modals/NotificationCenterModal.svelte";
  import type { LowQuantityProductRecords } from "$lib/helpers";
  import type { Notification } from "$lib/modals/notificationCenter.types";
  import OneSignal from "react-onesignal";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { genericGet } from "$lib/genericGet";

  export let supabase: any;
  $: activeUrl = $page.url.pathname;
  $: lowQuantityNotifications =
    lowQuantityProductRecords &&
    (lowQuantityProductRecords.map((x) => {
      return {
        data: {
          quantity: x.quantity!,
          notificationThreshold: x.notification_threshold!,
          unit: x.unit!,
        },
        name: x.name!,
        type: "low_quantity",
      };
    }) as Notification[]);

  let isNotificationCenterModalOpen = false;
  export let lowQuantityProductRecords: LowQuantityProductRecords[] = [];

  export let isThemeDark: boolean;
  onMount(() => {
    reloadTheme();
    genericGet(supabase.from("low_quantity_product_records_view").select("*"), (x) => {
      lowQuantityProductRecords = x as LowQuantityProductRecords[];
    });
  });

  const handleLogout = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    goto("/auth", { replaceState: true });
    supabase.auth.signOut();
    OneSignal.logout();
  };
  const activeClass =
    "flex items-center p-2 text-base font-normal text-gray-900 bg-primary-100 dark:bg-gray-700 rounded-lg dark:text-white";
  const nonActiveClass =
    "flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-primary-200 dark:hover:bg-primary-800";
  export let hideSidebar: boolean;
  function toggleSidebar() {
    hideSidebar = !hideSidebar;
  }
</script>

<Sidebar
  {activeUrl}
  {activeClass}
  {nonActiveClass}
  class="bg-primary-50 z-10 flex min-h-screen w-72 min-w-[18rem] flex-col justify-between px-4 md:sticky md:top-0  md:flex md:h-max dark:bg-gray-800"
>
  <div>
    <NotificationCenterModal
      bind:open={isNotificationCenterModalOpen}
      notifications={lowQuantityNotifications}
    />
    {#if isThemeDark}
      <img src={logo_dark} class="mb-8 mt-8 hidden md:inline-block" alt="InvTrack logo" />
    {:else}
      <img src={logo_light} class="mb-8 mt-8 hidden md:inline-block" alt="InvTrack logo" />
    {/if}
    <SidebarWrapper class="bg-primary-50 flex flex-col dark:bg-gray-800 ">
      <SidebarGroup>
        <SidebarItem
          label="Powiadomienia"
          spanClass="flex-1 ms-3 whitespace-nowrap"
          on:click={() => (isNotificationCenterModalOpen = true)}
        >
          <svelte:fragment slot="icon">
            <BellActiveAltSolid
              class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <svelte:fragment slot="subtext">
            <span
              class="bg-primary-200 text-primary-600 dark:bg-primary-900 dark:text-primary-200 ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full p-3 text-sm font-medium"
            >
              {lowQuantityProductRecords.length}
            </span>
          </svelte:fragment>
        </SidebarItem>
      </SidebarGroup>
      <SidebarGroup border>
        <SidebarItem label="Podsumowanie" href="/" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <HomeSolid
              class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Pracownicy" href="/workers" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <UsersSolid
              class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Inwentaryzacje" href="/inventories" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <ListSolid
              class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Produkty" href="/products" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <BriefcaseSolid
              class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
            /></svelte:fragment
          >
        </SidebarItem>
        <SidebarItem label="Recepturownik" href="/recipes" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <InboxFullSolid
              class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
            /></svelte:fragment
          >
        </SidebarItem>
      </SidebarGroup>
      <SidebarGroup border>
        <SidebarDropdownWrapper
          label="Twoje konto"
          class="hover:bg-primary-200 dark:hover:bg-primary-800"
        >
          <svelte:fragment slot="icon">
            <UsersSolid
              class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900  dark:text-gray-400 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <SidebarDropdownItem
            label="Wyloguj"
            on:click={handleLogout}
            class="hover:bg-red-300 dark:hover:bg-red-800"
          />
        </SidebarDropdownWrapper>
      </SidebarGroup>
    </SidebarWrapper>
  </div>
  <div>
    <SidebarWrapper class="bg-primary-50 mb-4 dark:bg-gray-800" border>
      <SidebarGroup class="flex flex-col">
        <h3 class="w-full rounded-lg text-base font-normal text-gray-900 dark:text-white">
          Zmień motyw
        </h3>
        <div class="flex flex-row">
          <SunSolid class="mr-2 h-6 w-6 text-gray-500 dark:text-gray-400" />
          <Toggle bind:checked={isThemeDark} on:click={toggleDarkMode} />
          <MoonSolid class="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
      </SidebarGroup>
    </SidebarWrapper>
  </div>
</Sidebar>
<!-- 
"mr-3 shrink-0 bg-gray-200 rounded-full peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white
after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full
after:transition-all dark:bg-gray-700 dark:border-gray-600 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800
peer-checked:bg-primary-600 w-11 h-6 after:top-0.5 after:left-[2px] after:h-5 after:w-5 relative" -->
