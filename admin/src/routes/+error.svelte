<script>
  import { page } from "$app/stores";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Button, Heading } from "flowbite-svelte";
  import logo_dark from "$lib/assets/logo-dark.png";
  import logo_light from "$lib/assets/logo-light.png";
  import { getIsThemeDark } from "$lib/scripts/darkMode";
  import { onMount } from "svelte";
  import Tooltip from "$lib/Tooltip.svelte";
  let isThemeDark = false;
  onMount(() => {
    isThemeDark = getIsThemeDark();
  });
</script>

<div class="absolute left-0 top-0 flex h-screen w-screen justify-center">
  <ScreenCard class="md:w-128 my-auto flex h-fit w-2/3 flex-col ">
    <div>
      {#if isThemeDark}
        <img src={logo_dark} class="w-2/3 max-w-[12rem]" alt="InvTrack" />
      {:else}
        <img src={logo_light} class="w-2/3 max-w-[12rem]" alt="InvTrack" />
      {/if}
    </div>
    <div class="absolute self-end">
      <Tooltip id="error-tooltip">
        <span class="max-w-[50%]">
          <p>
            Wystąpił nieoczekiwany błąd: {$page?.error?.message}
          </p>
        </span>
      </Tooltip>
    </div>
    <Heading tag="h2" class="text-primary-900 dark:text-primary-50 my-10 text-center"
      >Wystąpił błąd</Heading
    >
    <Button href="/" class="m-auto justify-self-end">Wróć</Button>
  </ScreenCard>
</div>
