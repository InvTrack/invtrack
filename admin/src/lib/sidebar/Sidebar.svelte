<script lang="ts">
  import { page } from "$app/stores";
  import { getIsThemeDark, toggleDarkMode } from "$lib/scripts/darkMode";
  import { supabase } from "$lib/supabase";
  import {
    Badge,
    Select,
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
    ListSolid,
    MoonSolid,
    SunSolid,
    UsersSolid,
  } from "flowbite-svelte-icons";
  import logo_dark from "$lib/assets/logo-dark.png";
  import logo_light from "$lib/assets/logo-light.png";
  import { onMount } from "svelte";
  import { genericGet } from "$lib/genericGet";
  import NotificationCenterModal from "$lib/modals/NotificationCenterModal.svelte";
  import type { LowQuantityProductRecords } from "$lib/helpers";
  import type { Notification } from "$lib/modals/notificationCenter.types";

  const handleLogout = () => supabase.auth.signOut();
  $: isThemeDark = getIsThemeDark();
  $: activeUrl = $page.url.pathname;
  let isNotificationCenterModalOpen = false;
  let lowQuantityProductRecords: LowQuantityProductRecords[] = [];
  let lowQuantityNotifications: Notification[] | null = null;
  onMount(() => {
    genericGet(supabase.from("low_quantity_product_records_view").select("*"), (x) => {
      lowQuantityProductRecords = x;
    });
  });

  $: lowQuantityNotifications =
    lowQuantityProductRecords &&
    lowQuantityProductRecords.map((x) => {
      return {
        data: {
          quantity: x.quantity!,
          notificationThreshold: x.notification_threshold!,
          unit: x.unit!,
        },
        name: x.name!,
        type: "low_quantity",
      };
    });
</script>

<Sidebar
  {activeUrl}
  class="h-screen sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 w-72 min-w-[18rem] z-10"
>
  <NotificationCenterModal
    bind:open={isNotificationCenterModalOpen}
    notifications={lowQuantityNotifications}
  />
  {#if isThemeDark}
    <img src={logo_dark} class="mt-8 mb-8" alt="InvTrack logo" />
  {:else}
    <img src={logo_light} class="mt-8 mb-8" alt="InvTrack logo" />
  {/if}
  <SidebarWrapper>
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
        <SidebarDropdownItem label="Sign out" on:click={handleLogout} />
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
