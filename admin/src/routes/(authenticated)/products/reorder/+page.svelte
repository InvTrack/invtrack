<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Button } from "flowbite-svelte";
  import { genericUpdate } from "$lib/genericUpdate";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import { beforeNavigate, goto } from "$app/navigation";
  import { currentCompanyId } from "$lib/store.js";

  let loading = false;
  let unsavedChanges = false;
  let unsavedChangesModal = false;
  let navigateTo: URL | undefined = undefined;
  let company_id: number | null = null;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  beforeNavigate(({ cancel, to }) => {
    if (!unsavedChanges) {
      return;
    }
    cancel();
    unsavedChangesModal = true;
    navigateTo = to?.url;
    return;
  });
  export let data;
  let { supabase, uncategorisedProducts, productCategories } = data;

  let columnItems = productCategories || [];
  if (company_id) {
    let uncategorisedColumn = {
      id: -1,
      name: "Brak kategorii",
      product: uncategorisedProducts,
      company_id: company_id,
      created_at: "",
      display_order: 2,
    };
    columnItems.push(uncategorisedColumn);
  }

  const flipDurationMs = 200;
  function handleDndConsiderColumns(e) {
    unsavedChanges = true;
    columnItems = e.detail.items;
  }
  function handleDndFinalizeColumns(e) {
    unsavedChanges = true;
    columnItems = e.detail.items;
  }
  function handleDndConsiderCards(cid, e) {
    unsavedChanges = true;
    const colIdx = columnItems.findIndex((c) => c.id === cid);
    columnItems[colIdx].product = e.detail.items;
    columnItems = [...columnItems];
  }
  function handleDndFinalizeCards(cid, e) {
    unsavedChanges = true;
    const colIdx = columnItems.findIndex((c) => c.id === cid);
    columnItems[colIdx].product = e.detail.items;
    columnItems = [...columnItems];
  }
  const update = () => {
    loading = true;
    console.log(columnItems);
    columnItems
      .filter((col) => col.id >= 0)
      .forEach((col, i) => {
        genericUpdate(
          supabase
            .from("product_category")
            .update({
              display_order: i,
            })
            .eq("id", col.id),
          { setLoading: (x) => (loading = x) }
        );
      });
    columnItems.forEach((col) => {
      col.product.forEach((prod, i) => {
        genericUpdate(
          supabase
            .from("product")
            .update({
              display_order: i,
              category_id: col.id >= 0 ? col.id : null,
            })
            .eq("id", prod.id),
          { setLoading: (x) => (loading = x) }
        );
      });
    });
    unsavedChanges = false;
    loading = false;
  };

  const onUnsavedWarningContinue = () => {
    unsavedChanges = false;
    unsavedChangesModal = false;
    if (navigateTo) {
      goto(navigateTo);
    }
  };
</script>

<ScreenCard header="Produkty">
  <UnsavedWarningModal
    bind:open={unsavedChangesModal}
    onContinue={onUnsavedWarningContinue}
    onStay={() => (unsavedChangesModal = false)}
  />
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
            <div class="card" animate:flip={{ duration: flipDurationMs }}>
              {item.name}
            </div>
          {/each}
          {#if column.product.length < 1}
            <div>...</div>
          {/if}
        </div>
      </div>
    {/each}
  </section>
  <Button class="mt-4" color="primary" on:click={update}
    >{loading ? "Zapisywanie..." : "Aktualizuj kolejność"}</Button
  >
</ScreenCard>

<style>
  .board {
  }
  .column {
    padding: 0.5em;
    margin: 0.5em;
    border: 1px solid grey;
    border-radius: 4px;
  }
  .column-content {
  }
  .column-title {
  }
  .card {
    margin: 0.5em;
    border: 1px solid grey;
    border-radius: 4px;
  }
</style>
