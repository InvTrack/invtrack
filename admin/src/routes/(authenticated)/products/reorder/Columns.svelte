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
  class="flex max-h-[65vh] flex-row flex-wrap overflow-scroll"
  use:dragHandleZone={{ items: columnsContainer.columns, flipDurationMs, type: "columns" }}
  on:consider={handleDndConsiderColumns}
  on:finalize={handleDndFinalizeColumns}
>
  {#each columnsContainer.columns as column, columnIndex (column.id)}
    <div
      class="m-1 flex max-h-[60vh] min-w-[4rem] max-w-sm flex-col divide-gray-200
          rounded-lg border-2 border-gray-200 bg-white p-4 text-gray-500 shadow-md
         sm:p-6 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
      animate:flip={{ duration: flipDurationMs }}
    >
      <div use:dragHandle aria-label="drag-handle for {column.name} category" class="self-end">
        <BarsOutline class="h-3 w-3" />
      </div>
      <div class="column-title">{columnIndex + 1 + " - " + column.name}</div>
      <div
        class="flex flex-row flex-wrap overflow-scroll"
        use:dragHandleZone={{ items: column.items, flipDurationMs, centreDraggedOnCursor: true }}
        on:consider={(e) => handleDndConsiderCards(column.id, e)}
        on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
      >
        {#each column.items as item (item.id)}
          <div animate:flip={{ duration: flipDurationMs }}>
            <Badge class="m-1 p-2">
              <div use:dragHandle aria-label="drag-handle for {item.name} product">
                <BarsOutline class="mr-1 h-2 w-2" />
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
