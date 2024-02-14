<script lang="ts">
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import "./styles.css";

  import { onMount } from "svelte";
  import { googleAccessToken, currentCompanyId } from "$lib/store";
  import { initializeDarkMode } from "$lib/scripts/darkMode";
  import type { CurrentCompanyIdTable } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import OneSignal from "react-onesignal";
  import { browser } from "$app/environment";
  import { PUBLIC_ONESIGNAL_APP_ID, PUBLIC_ONESIGNAL_SAFARI_WEB_ID } from "$env/static/public";
  import { invalidate } from "$app/navigation";

  export let data;
  let { supabase, session } = data;
  $: ({ supabase, session } = data);

  $: if (session && browser) {
    OneSignal.login(session.user.id);
  }
  onMount(() => {
    const {
      data: { subscription: supabaseSubscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    if (browser) {
      initializeDarkMode();
      //
      OneSignal.init({
        appId: PUBLIC_ONESIGNAL_APP_ID,
        safari_web_id: PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
        notifyButton: {
          enable: true,
        },
        allowLocalhostAsSecureOrigin: import.meta.env.DEV,
      }).then(() => {
        OneSignal.Slidedown.promptPush({
          // TODO: tłumaczenie
          forceSlidedownOverNative: true,
          slidedownPromptOptions: {
            force: true,
            categoryOptions: {
              errorButtonText: "Zamknij",
              negativeUpdateButton: "Nie, dziękuję",
              positiveUpdateButton: "Tak, chcę",
              savingButtonText: "Zapisywanie...",
              updateMessage: "Czy chcesz otrzymywać powiadomienia o nowych produktach?",
              tags: [{ label: "Powiadomienia", checked: true, tag: "powiadomienia" }],
            },
          },
        });
      });
    }

    genericGet(
      supabase
        .from<"current_company_id", CurrentCompanyIdTable>("current_company_id")
        .select()
        .single(),
      (x) => currentCompanyId.set(x?.id)
    );

    return () => supabaseSubscription.unsubscribe();
  });
</script>

<svelte:head>
  <title>InvTrack - panel administratora</title>
  <meta name="description" content="InvTrack" />

  <link rel="apple-touch-icon" sizes="180x180" href="../favicons/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="../favicons/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="../favicons/favicon-16x16.png" />
  <link rel="manifest" href="../favicons/site.webmanifest" />
  <link rel="mask-icon" href="../favicons/safari-pinned-tab.svg" color="#3986e5" />
  <link rel="shortcut icon" href="../favicons/favicon.ico" />
  <meta name="apple-mobile-web-app-title" content="InvTrack" />
  <meta name="application-name" content="InvTrack" />
  <meta name="msapplication-TileColor" content="#2b5797" />
  <meta name="msapplication-config" content="../favicons/browserconfig.xml" />
  <meta name="theme-color" content="#111827" />
</svelte:head>

<div class="flex flex-row">
  <Sidebar {supabase} />
  <main class="flex-1 bg-white dark:bg-primary-900">
    <slot />
  </main>
</div>
