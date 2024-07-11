<script lang="ts">
  import { Popover } from "flowbite-svelte";
  import { QuestionCircleSolid, ChevronRightOutline } from "flowbite-svelte-icons";
  /**
   * Unique identifier for the tooltip. Triggers and connects the tooltip with the icon.
   */
  export let id: string;
</script>

<div class="flex items-center text-sm font-light text-gray-500 dark:text-gray-400">
  <button type="button" {id}>
    <QuestionCircleSolid class="ms-1.5 h-4 w-4" />
    <span class="sr-only">Pokaż więcej informacji</span>
  </button>
</div>
<Popover
  placement="right-end"
  triggeredBy={`#${id}`}
  class="w-72 max-w-[50vw] bg-white text-sm font-light text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
>
  <slot />
  <!-- <div class="p-3 space-y-2">
    <h3 class="font-semibold text-gray-900 dark:text-white">Activity growth - Incremental</h3>
    Report helps navigate cumulative growth of community activities. Ideally, the chart should have a
    growing trend. -->
  <!-- <h3 class="font-semibold text-gray-900 dark:text-white">Calculation</h3>
    For each date bucket, the all-time volume of activities is calculated. This means that activities
    in period n contain all activities up to period n.
    <a
      href="/"
      class="flex items-center font-medium text-primary-600 dark:text-primary-500 dark:hover:text-primary-600 hover:text-primary-700"
    >
      Read more <ChevronRightOutline
        class="w-2 h-2 ms-1.5 text-primary-600 dark:text-primary-500"
      />
    </a> -->
  <!-- </div> -->
</Popover>
