<script lang="ts">
  import { flip } from "svelte/animate";
  import { dragHandleZone, dragHandle, type DndEvent } from "svelte-dnd-action";
  import { Badge } from "flowbite-svelte";
  import type { DndItemEvent, Items } from "./types";
  import { BarsOutline } from "flowbite-svelte-icons";

  export let itemsContainer: { items: Items };
  export let setUnsavedChanges: () => {};

  function handleDndConsider(e: DndItemEvent) {
    setUnsavedChanges();
    itemsContainer.items = e.detail.items;
  }
  function handleDndFinalize(e: DndItemEvent) {
    setUnsavedChanges();
    itemsContainer.items = e.detail.items;
  }

  const flipDurationMs = 300;
</script>

<section
  class="overflow-scroll flex flex-row flex-wrap"
  use:dragHandleZone={{ items: itemsContainer.items, flipDurationMs }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each itemsContainer.items as item (item.id)}
    <div class="overflow-scroll" animate:flip={{ duration: flipDurationMs }}>
      <Badge class="p-2 m-1">
        <div use:dragHandle aria-label="drag-handle for {item.name} product">
          <BarsOutline class="w-2 h-2 mr-1" />
        </div>
        {item.name}
      </Badge>
    </div>
  {/each}
  {#if itemsContainer.items.length <= 0}
    <div>...</div>
  {/if}
</section>
