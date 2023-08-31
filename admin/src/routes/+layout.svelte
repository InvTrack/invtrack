<script lang="ts">
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import "./styles.css";

  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { AuthSession } from "@supabase/supabase-js";
  import { page } from "$app/stores";
  import { googleAccessToken } from "$lib/store";
  import Login from "./auth/Login.svelte";
  import { initializeDarkMode } from "$lib/scripts/darkMode";

  let session: AuthSession | null;

  onMount(() => {
    initializeDarkMode();
    const urlStringOriginal = $page.url.href;
    if (urlStringOriginal?.includes("#access_token")) {
      const urlString = urlStringOriginal.replace("#access_token", "?access_token");
      const url = new URL(urlString);
      const refreshToken = url.searchParams.get("refresh_token");
      const accessToken = url.searchParams.get("access_token");
      const providerToken = url.searchParams.get("provider_token");
      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({
            refresh_token: refreshToken,
            access_token: accessToken,
          })
          .then((res) => {
            res.data.session;
          })
          .catch((err) => console.log({ err }));
      }
      if (providerToken) {
        googleAccessToken.set(providerToken);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      session = data.session;
    });

    supabase.auth.onAuthStateChange((_event, _session) => {
      session = _session;
    });
  });
</script>

<svelte:head>
  <title>Invtrack Dashboard</title>
  <meta name="description" content="Invtrack Dashboard" />
</svelte:head>
{#if !session}
  <Login />
{:else}
  <div class="flex flex-row">
    <Sidebar />
    <main class="flex-1 bg-white dark:bg-primary-900">
      <slot />
    </main>
  </div>
{/if}
