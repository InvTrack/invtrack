<script lang="ts">
  import { page } from "$app/stores";
  import { getIsThemeDark, toggleDarkMode } from "$lib/scripts/darkMode";
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
  import { browser } from "$app/environment";

  export let supabase: any;
  let isThemeDark: boolean = true;
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

  onMount(() => {
    if (browser) {
      isThemeDark = getIsThemeDark();
    }
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

  export let hideSidebar: boolean;
  function toggleSidebar() {
    hideSidebar = !hideSidebar;
  }
</script>

<Sidebar
  {activeUrl}
  class="h-screen absolute flex md:sticky top-0 bg-gray-200 dark:bg-gray-800 px-4 w-72 min-w-[18rem] z-10 md:flex flex-col justify-between "
>
  <div>
    <NotificationCenterModal
      bind:open={isNotificationCenterModalOpen}
      notifications={lowQuantityNotifications}
    />
    {#if isThemeDark}
      <img src={logo_dark} class="mt-8 mb-8 hidden md:inline-block" alt="InvTrack logo" />
    {:else}
      <img src={logo_light} class="mt-8 mb-8 hidden md:inline-block" alt="InvTrack logo" />
    {/if}
    <SidebarWrapper class="bg-gray-200 dark:bg-gray-800 flex flex-col ">
      <SidebarGroup>
        <SidebarItem
          label="Powiadomienia"
          spanClass="flex-1 ms-3 whitespace-nowrap"
          on:click={() => (isNotificationCenterModalOpen = true)}
        >
          <svelte:fragment slot="icon">
            <BellActiveAltSolid
              class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <svelte:fragment slot="subtext">
            <span
              class="inline-flex justify-center items-center p-3 ms-3 w-3 h-3 text-sm font-medium text-primary-600 bg-primary-200 rounded-full dark:bg-primary-900 dark:text-primary-200"
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
              active={activeUrl === "/"}
              class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Pracownicy" href="/workers" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <UsersSolid
              active={activeUrl === "/workers"}
              class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Inwentaryzacje" href="/inventories" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <ListSolid
              active={activeUrl === "/inventories"}
              class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Produkty" href="/products" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <BriefcaseSolid
              active={activeUrl === "/products"}
              class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            /></svelte:fragment
          >
        </SidebarItem>
        <SidebarItem label="Recepturownik" href="/recipes" on:click={() => toggleSidebar()}>
          <svelte:fragment slot="icon">
            <InboxFullSolid
              active={activeUrl === "/recipes"}
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
    </SidebarWrapper>
  </div>
  <div>
    <SidebarWrapper class="bg-gray-200 dark:bg-gray-800 mb-4" border>
      <SidebarGroup class="flex flex-col">
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
  </div>
</Sidebar>
<!-- 
"mr-3 shrink-0 bg-gray-200 rounded-full peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white
after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full
after:transition-all dark:bg-gray-700 dark:border-gray-600 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800
peer-checked:bg-primary-600 w-11 h-6 after:top-0.5 after:left-[2px] after:h-5 after:w-5 relative" -->
