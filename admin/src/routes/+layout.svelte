<script lang="ts">
  import Navbar from "../lib/navbar/Navbar.svelte";
  import "./styles.css";

  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { AuthSession } from "@supabase/supabase-js";
  import { page } from "$app/stores";
  import { googleAccessToken } from "$lib/store";
  import Login from "./auth/Login.svelte";
  // import Account from './lib/Account.svelte'
  // import Auth from './lib/Auth.svelte'

  let session: AuthSession | null;

  onMount(() => {
    // console.log($page)
    const urlStringOriginal = $page.url.href;
    if (urlStringOriginal?.includes("#access_token")) {
      const urlString = urlStringOriginal.replace("#access_token", "?access_token");
      const url = new URL(urlString);
      const refreshToken = url.searchParams.get("refresh_token");
      const accessToken = url.searchParams.get("access_token");
      const providerToken = url.searchParams.get("provider_token");
      console.log({
        urlStringOriginal,
        providerToken,
        accessToken,
        refreshToken,
      });
      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({
            refresh_token: refreshToken,
            access_token: accessToken,
          })
          .then((res) => {
            // console.log({ res });
            // setSession(session);
            res.data.session;
          })
          .catch((err) => console.log({ err }));
      }
      if (providerToken) {
        console.log({ providerToken });
        googleAccessToken.set(providerToken);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      console.log(data);
      session = data.session;
    });

    supabase.auth.onAuthStateChange((_event, _session) => {
      console.log("auth state changed");
      session = _session;
    });
  });
</script>

<!-- <div class="app">
</div> -->

{#if !session}
  <Login />
{:else}
  <div class="flex flex-row">
    <Navbar />
    <main class="flex-1">
      <slot />
    </main>
  </div>
{/if}
