<script>
  import { Card } from "flowbite-svelte";
</script>

<div class="grid h-screen place-items-center">
  <Card class="w-full max-w-md">
    <slot />
  </Card>
</div>
