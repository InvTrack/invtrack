<script lang="ts">
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { genericUpdate } from "$lib/genericUpdate.js";
  import { currentCompanyId } from "$lib/store.js";
  import { Button } from "flowbite-svelte";
  import Columns from "$lib/dnd/Columns.svelte";
  import BareItems from "$lib/dnd/BareItems.svelte";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";

  export let data;

  let loading = false;
  let unsavedChanges = false;
  let company_id: number | null = null;
  let { supabase, uncategorisedProducts, categories } = data;
  // Wrap the array in an object. Otherwise, <HorizontalList/> would create a new array local to itself on every edit, making it inaccessible here.
  let uncategorisedProductsContainer = { items: uncategorisedProducts || [] };
  // Same as above, but for <Columns/>
  let categoriesContainer = { columns: categories || [] };

  currentCompanyId.subscribe((id) => id && (company_id = id));

  const update = () => {
    loading = true;
    // Update the order of categories
    categoriesContainer.columns.forEach(async (category, i) =>
      genericUpdate(
        supabase
          .from("product_category")
          .update({
            display_order: i,
          })
          .eq("id", category.id),
        { setLoading: (x) => (loading = x) }
      )
    );
    // Update the order of products, and which category they belong too
    categoriesContainer.columns.forEach((category) => {
      category.items.forEach(async (product, i) =>
        genericUpdate(
          supabase
            .from("product")
            .update({
              display_order: i,
              category_id: category.id,
            })
            .eq("id", product.id),
          { setLoading: (x) => (loading = x) }
        )
      );
    });
    // Update the order of products, which don't belong to any category
    uncategorisedProductsContainer.items.forEach((product, i) =>
      genericUpdate(
        supabase
          .from("product")
          .update({
            display_order: i,
            category_id: null,
          })
          .eq("id", product.id),
        { setLoading: (x) => (loading = x) }
      )
    );
    unsavedChanges = false;
    loading = false;
  };

  const setUnsavedChanges = () => (unsavedChanges = true);
</script>

<ScreenCard header="Produkty">
  <UnsavedWarningModal bind:unsavedChanges />
  <BareItems itemsContainer={uncategorisedProductsContainer} {setUnsavedChanges} />
  <Columns columnsContainer={categoriesContainer} {setUnsavedChanges} />
  <Button class="mt-4" color="primary" on:click={update}
    >{loading ? "Zapisywanie..." : "Aktualizuj kolejność"}</Button
  >
  <Button class="hover:underline" href={`/products/reorder/add-category`}>Dodaj kategorię</Button>
</ScreenCard>
