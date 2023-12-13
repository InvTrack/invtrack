<script lang="ts">
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import "./styles.css";

  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { AuthSession } from "@supabase/supabase-js";
  import { page } from "$app/stores";
  import { googleAccessToken, currentCompanyId } from "$lib/store";
  import Login from "./auth/Login.svelte";
  import { initializeDarkMode } from "$lib/scripts/darkMode";
  import Gate from "./auth/Gate.svelte";
  import type { CurrentCompanyIdTable } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import Auth from "./auth/Auth.svelte";

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

    genericGet(
      supabase
        .from<"current_company_id", CurrentCompanyIdTable>("current_company_id")
        .select()
        .single(),
      (x) => currentCompanyId.set(x?.id)
    );
  });
</script>

<svelte:head>
  <title>Invtrack</title>
  <meta name="description" content="Invtrack" />
</svelte:head>
{#if !session}
  <Auth />
{:else}
  <Gate>
    <div class="flex flex-row">
      <Sidebar />
      <main class="flex-1 bg-white dark:bg-primary-900">
        <slot />
      </main>
    </div>
  </Gate>
{/if}
