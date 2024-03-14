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
  const flipDurationMs = 100;

  export let data;

  let loading = false;
  let unsavedChanges = false;
  let unsavedChangesModal = false;
  let navigateTo: URL | undefined = undefined;
  let company_id: number | null = null;

  let { supabase, uncategorisedProducts, productCategories } = data;
  let categories = productCategories || [];

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

  if (company_id && uncategorisedProducts) {
    let uncategorisedColumn = {
      id: -1,
      name: "Brak kategorii",
      products: uncategorisedProducts,
      company_id,
      created_at: "",
      display_order: 0,
    };
    categories.unshift(uncategorisedColumn);
  }

  function handleDndConsiderCategories(e: DndE) {
    unsavedChanges = true;
    categories = e.detail.items;
  }
  function handleDndFinalizeCategories(e: DndE) {
    unsavedChanges = true;
    categories = e.detail.items;
  }
  function handleDndConsiderProducts(cid: number, e: Dnd2E) {
    unsavedChanges = true;
    const categoryIdx = categories.findIndex((c) => c.id === cid);
    categories[categoryIdx].products = e.detail.items;
    categories = [...categories];
  }
  function handleDndFinalizeProducts(cid: number, e: Dnd2E) {
    unsavedChanges = true;
    const categoryIdx = categories.findIndex((c) => c.id === cid);
    categories[categoryIdx].products = e.detail.items;
    categories = [...categories];
  }
  const update = () => {
    loading = true;
    categories
      .filter((category) => category.id >= 0)
      .forEach(async (category, i) => {
        await genericUpdate(
          supabase
            .from("product_category")
            .update({
              display_order: i,
            })
            .eq("id", category.id),
          { setLoading: (x) => (loading = x) }
        );
      });
    categories.forEach((category) => {
      category.products.forEach(async (product, i) => {
        await genericUpdate(
          supabase
            .from("product")
            .update({
              display_order: i,
              category_id: category.id >= 0 ? category.id : null,
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
    use:dndzone={{
      items: categories,
      flipDurationMs,
      type: "categories",
    }}
    on:consider={handleDndConsiderCategories}
    on:finalize={handleDndFinalizeCategories}
  >
    {#each categories as category (category.id)}
      <!-- nesting divs (flowbite styling) breaks the dnd functionality -->
      <div
        class="flex flex-col min-w-[4rem] m-1 p-4 sm:p-6 border-2
         max-w-sm rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-500
         dark:text-gray-400 border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700"
        animate:flip={{ duration: flipDurationMs }}
      >
        <div class="text-lg text-white">{category.name}</div>
        <div
          class="flex flex-row flex-wrap"
          use:dndzone={{
            items: category.products,
            flipDurationMs,
            type: "products",
          }}
          on:consider={(e) => handleDndConsiderProducts(category.id, e)}
          on:finalize={(e) => handleDndFinalizeProducts(category.id, e)}
        >
          {#each category.products as item (item.id)}
            <div animate:flip={{ duration: flipDurationMs }}>
              <Badge class="p-2 m-2">
                {item.name}
              </Badge>
            </div>
          {/each}
          {#if category.products.length < 1}
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
