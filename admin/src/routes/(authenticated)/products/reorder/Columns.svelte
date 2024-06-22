<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, type DndEvent } from "svelte-dnd-action";
  import { Badge, Button } from "flowbite-svelte";
  import type { Columns, DndColumnEvent, DndItemEvent } from "./types";

  export let columnsContainer: { columns: Columns };
  export let setUnsavedChanges: () => {};

  const flipDurationMs = 200;
  function handleDndConsiderColumns(e: DndColumnEvent) {
    setUnsavedChanges();
    columnsContainer.columns = e.detail.items;
  }
  function handleDndFinalizeColumns(e: DndColumnEvent) {
    setUnsavedChanges();
    columnsContainer.columns = e.detail.items;
  }
  function handleDndConsiderCards(cid: number, e: DndItemEvent) {
    setUnsavedChanges();
    const colIdx = columnsContainer.columns.findIndex((c) => c.id === cid);
    columnsContainer.columns[colIdx].items = e.detail.items;
    columnsContainer.columns = [...columnsContainer.columns];
  }
  function handleDndFinalizeCards(cid: number, e: DndItemEvent) {
    setUnsavedChanges();
    const colIdx = columnsContainer.columns.findIndex((c) => c.id === cid);
    columnsContainer.columns[colIdx].items = e.detail.items;
    columnsContainer.columns = [...columnsContainer.columns];
  }
</script>

<section
  class="board"
  use:dndzone={{ items: columnsContainer.columns, flipDurationMs, type: "columns" }}
  on:consider={handleDndConsiderColumns}
  on:finalize={handleDndFinalizeColumns}
>
  {#each columnsContainer.columns as column (column.id)}
    <div
      class="m-1 flex min-w-[4rem] max-w-sm flex-col divide-gray-200 rounded-lg
         border-2 border-gray-200 bg-white p-4 text-gray-500 shadow-md
         dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:p-6"
      animate:flip={{ duration: flipDurationMs }}
    >
      <div class="column-title">{column.name}</div>
      <div
        class="flex flex-row flex-wrap"
        use:dndzone={{ items: column.items, flipDurationMs }}
        on:consider={(e) => handleDndConsiderCards(column.id, e)}
        on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
      >
        {#each column.items as item (item.id)}
          <div animate:flip={{ duration: flipDurationMs }}>
            <Badge class="m-2 p-2">
              {item.name}
            </Badge>
          </div>
        {/each}
        {#if column.items.length <= 0}
          <div>...</div>
        {/if}
      </div>
      <Button class="hover:underline" href={`/products/reorder/${column.id}`}>Edytuj</Button>
    </div>
  {/each}
</section>
