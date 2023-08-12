<script lang="ts">
  import { page } from "$app/stores";
  export let path: string;
</script>

<li aria-current={$page.url.pathname === path ? "page" : undefined}>
  <a href={path} class="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
    <slot />
  </a>
</li>
