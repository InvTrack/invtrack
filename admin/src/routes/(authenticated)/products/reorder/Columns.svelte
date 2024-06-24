<script lang="ts">
  import { flip } from "svelte/animate";
  import { dragHandleZone, dragHandle } from "svelte-dnd-action";
  import { Badge, Button } from "flowbite-svelte";
  import type { Columns, DndColumnEvent, DndItemEvent } from "./types";
  import { BarsOutline } from "flowbite-svelte-icons";
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
  class="max-h-[65vh] overflow-scroll flex flex-row flex-wrap"
  use:dragHandleZone={{ items: columnsContainer.columns, flipDurationMs, type: "columns" }}
  on:consider={handleDndConsiderColumns}
  on:finalize={handleDndFinalizeColumns}
>
  {#each columnsContainer.columns as column, columnIndex (column.id)}
    <div
      class="draggable-category flex flex-col min-w-[4rem] m-1 p-4 sm:p-6 border-2
          max-w-[18%] max-h-[60vh] rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-500
         dark:text-gray-400 border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700"
      animate:flip={{ duration: flipDurationMs }}
      id="draggable-category"
    >
      <div use:dragHandle aria-label="drag-handle for {column.name} category" class="self-end">
        <BarsOutline class="w-3 h-3" />
      </div>
      <div class="column-title">{columnIndex + 1 + " - " + column.name}</div>
      <div
        class="overflow-scroll flex flex-row flex-wrap"
        use:dragHandleZone={{ items: column.items, flipDurationMs, centreDraggedOnCursor: true }}
        on:consider={(e) => handleDndConsiderCards(column.id, e)}
        on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
      >
        {#each column.items as item (item.id)}
          <div animate:flip={{ duration: flipDurationMs }}>
            <Badge class="p-2 m-1">
              <div use:dragHandle aria-label="drag-handle for {item.name} product">
                <BarsOutline class="w-2 h-2 mr-1" />
              </div>
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
