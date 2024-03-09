<script>
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Card } from "flowbite-svelte";
  export let data;
  let { products, uncategorisedProducts, productCategories } = data;

  let columnItems = productCategories || [];
  let uncategorisedColumn = {
    id: null,
    name: "Brak kategorii",
    product: uncategorisedProducts,
    company_id: 1,
    created_at: "",
    display_order: 2,
  };
  columnItems.push(uncategorisedColumn);

  const flipDurationMs = 200;
  function handleDndConsiderColumns(e) {
    // console.log("ConsiderColumns", columnItems, e.detail.items);
    // if (e.detail.info.id === -1) return;
    columnItems = e.detail.items;
  }
  function handleDndFinalizeColumns(e) {
    // console.log("FinalizeColumns", columnItems, e.detail.items);
    // if (e.detail.info.id === -1) return;
    columnItems = e.detail.items;
  }
  function handleDndConsiderCards(cid, e) {
    // console.log("FinalizeCards", cid);
    const colIdx = columnItems.findIndex((c) => c.id === cid);
    columnItems[colIdx].product = e.detail.items;
    columnItems = [...columnItems];
  }
  function handleDndFinalizeCards(cid, e) {
    // console.log("FinalizeCards", cid);
    const colIdx = columnItems.findIndex((c) => c.id === cid);
    columnItems[colIdx].product = e.detail.items;
    columnItems = [...columnItems];
  }
  function handleClick(e) {
    alert("dragabble elements are still clickable :)");
  }
</script>

<ScreenCard header="Produkty">
  <section
    class="board"
    use:dndzone={{ items: columnItems, flipDurationMs, type: "columns" }}
    on:consider={handleDndConsiderColumns}
    on:finalize={handleDndFinalizeColumns}
  >
    {#each columnItems as column (column.id)}
      <div class="column" animate:flip={{ duration: flipDurationMs }}>
        <div class="column-title">{column.name}</div>
        <div
          class="column-content"
          use:dndzone={{ items: column.product, flipDurationMs }}
          on:consider={(e) => handleDndConsiderCards(column.id, e)}
          on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
        >
          {#each column.product as item (item.id)}
            <div class="card" animate:flip={{ duration: flipDurationMs }} on:click={handleClick}>
              {item.name}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </section>
</ScreenCard>

<style>
  .board {
    /* height: 90vh;
    width: 100%;
    padding: 0.5em;
    margin-bottom: 40px; */
  }
  .column {
    /* height: 100%; */
    /* width: 250px; */
    padding: 0.5em;
    margin: 0.5em;
    /* float: left; */
    border: 1px solid grey;
    border-radius: 4px;
    /*Notice we make sure this container doesn't scroll so that the title stays on top and the dndzone inside is scrollable*/
    /* overflow-y: hidden; */
  }
  .column-content {
    /* height: 100%; */
    /* Notice that the scroll container needs to be the dndzone if you want dragging near the edge to trigger scrolling */
    /* overflow-y: scroll; */
  }
  .column-title {
    /* margin-bottom: 1em; */
    /* display: flex;
    justify-content: center;
    align-items: center; */
  }
  .card {
    /* display: flex;
    justify-content: center;
    align-items: center; */
    /* background-color: #dddddd; */
    margin: 0.5em;
    border: 1px solid grey;
    border-radius: 4px;
  }
</style>
