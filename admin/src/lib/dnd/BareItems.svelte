<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, type DndEvent } from "svelte-dnd-action";
  import { Badge } from "flowbite-svelte";
  import type { DndItemEvent, Items } from "./types";

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
  class="flex flex-row flex-wrap"
  use:dndzone={{ items: itemsContainer.items, flipDurationMs }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each itemsContainer.items as item (item.id)}
    <div animate:flip={{ duration: flipDurationMs }}>
      <Badge class="p-2 m-2">
        {item.name}
      </Badge>
    </div>
  {/each}
  {#if itemsContainer.items.length <= 0}
    <div>...</div>
  {/if}
</section>
