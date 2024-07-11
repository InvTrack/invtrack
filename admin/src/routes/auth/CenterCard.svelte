<script>
  import { Card } from "flowbite-svelte";
</script>

<!-- TODO: add InvTrack name and/or logo somewhere here -->
<div class="grid h-screen place-items-center dark:bg-primary-900 bg-white">
  <Card class="w-full max-w-md">
    <slot />
  </Card>
</div>
