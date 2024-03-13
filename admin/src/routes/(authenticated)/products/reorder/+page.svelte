<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, type DndEvent } from "svelte-dnd-action";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Badge, Button, Card } from "flowbite-svelte";
  import { genericUpdate } from "$lib/genericUpdate";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import { beforeNavigate, goto } from "$app/navigation";
  import { currentCompanyId } from "$lib/store.js";

  type DndE = CustomEvent<DndEvent<NonNullable<typeof productCategories>[number]>>;
  type Dnd2E = CustomEvent<
    DndEvent<NonNullable<typeof productCategories>[number]["products"][number]>
  >;

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
  if (company_id && uncategorisedProducts) {
    let uncategorisedColumn = {
      id: -1,
      name: "Brak kategorii",
      products: uncategorisedProducts,
      company_id,
      created_at: "",
      display_order: 0,
    };
    columnItems.unshift(uncategorisedColumn);
  }

  const flipDurationMs = 200;
  function handleDndConsiderCategories(e: DndE) {
    unsavedChanges = true;
    columnItems = e.detail.items;
  }
  function handleDndFinalizeCategories(e: DndE) {
    unsavedChanges = true;
    columnItems = e.detail.items;
  }
  function handleDndConsiderProducts(cid: number, e: Dnd2E) {
    unsavedChanges = true;
    const colIdx = columnItems.findIndex((c) => c.id === cid);
    columnItems[colIdx].products = e.detail.items;
    columnItems = [...columnItems];
  }
  function handleDndFinalizeProducts(cid: number, e: Dnd2E) {
    unsavedChanges = true;
    const colIdx = columnItems.findIndex((c) => c.id === cid);
    columnItems[colIdx].products = e.detail.items;
    columnItems = [...columnItems];
  }
  const update = () => {
    loading = true;
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
      col.products.forEach((product, i) => {
        genericUpdate(
          supabase
            .from("product")
            .update({
              display_order: i,
              category_id: col.id >= 0 ? col.id : null,
            })
            .eq("id", product.id),
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
    class="flex flex-col flex-wrap w-full"
    use:dndzone={{ items: columnItems, flipDurationMs, type: "categories" }}
    on:consider={handleDndConsiderCategories}
    on:finalize={handleDndFinalizeCategories}
  >
    {#each columnItems as column (column.id)}
      <div
        class="min-w-[4rem] hover:border-0"
        animate:flip={{
          duration: flipDurationMs,
        }}
      >
        <Card class="m-1 border-2 flex-col ">
          <div class="text-lg text-white">{column.name}</div>
          <div
            class="flex flex-row flex-wrap"
            use:dndzone={{ items: column.products, flipDurationMs, type: "products" }}
            on:consider={(e) => handleDndConsiderProducts(column.id, e)}
            on:finalize={(e) => handleDndFinalizeProducts(column.id, e)}
          >
            {#each column.products as item (item.id)}
              <div animate:flip={{ duration: flipDurationMs }}>
                <Badge class="p-2 m-2">
                  {item.name}
                </Badge>
              </div>
            {/each}
            {#if column.products.length < 1}
              <div>...</div>
            {/if}
          </div>
        </Card>
      </div>
    {/each}
  </section>
  <Button class="mt-4" color="primary" on:click={update}
    >{loading ? "Zapisywanie..." : "Aktualizuj kolejność"}</Button
  >
</ScreenCard>
