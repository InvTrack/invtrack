<script>
  import { Card } from "flowbite-svelte";
</script>

<!-- TODO: add InvTrack name and/or logo somewhere here -->
<div class="grid h-screen place-items-center">
  <Card class="w-full max-w-md">
    <slot />
  </Card>
</div>
