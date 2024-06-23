<script lang="ts">
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { genericUpdate } from "$lib/genericUpdate.js";
  import { currentCompanyId } from "$lib/store.js";
  import { Button, Span } from "flowbite-svelte";
  import Columns from "./Columns.svelte";
  import BareItems from "./BareItems.svelte";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import Tooltip from "$lib/Tooltip.svelte";
  import { BarsOutline } from "flowbite-svelte-icons";

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
        { setLoading: (x) => (loading = x), onSuccess: "/products" }
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

<ScreenCard header="Produkty" class="flex flex-col gap-2">
  <Span class="flex flex-row self-end"
    >Jak używać edytora? <Tooltip id="products-dnd-ttip">
      <div class="p-3">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          Edytor drag'n'drop - jak używać?
        </h3>
        <div class="inline">
          W InvTrack, możliwe jest ułożenie produktów i kategorii w ustalonej przez siebie
          kolejności. Dodatkowo, produkty mogą zawierać się w kategorii, również w ustalonej
          kolejności.
          <br />
          - Aby przesunąć produkt, złap go za ikonę <BarsOutline class="w-2 inline " /> i przesuń w dowolne
          miejsce w obrębie kategorii, lub do obszaru bez kategorii (na samej górze ekranu).
          <br />
          To samo zrób z kategorią, by zmienić jej kolejność.
          <br />
          - Kategorie mogą zawierać dużo produktów, <u>autoprzewijanie (scroll)</u> działa przy
          zblieniu się z przesuwanym produktem do górnej lub dolnej granicy kategorii.
          <br />
        </div>
        <u>Numery przed nazwą kategorii nie wyświetlają się w aplikacji mobilnej.</u>
        <br />
        <strong class="text-gray-900 dark:text-white">
          Odpowiednia kolejność wyjątkowo pomaga w aplikacji. Proponujemy ustalić kolejność zgodnie
          z występowaniem w magazynie, lub po dostawcach.
        </strong>
      </div>
    </Tooltip></Span
  >
  <UnsavedWarningModal bind:unsavedChanges />
  <BareItems itemsContainer={uncategorisedProductsContainer} {setUnsavedChanges} />
  <Columns columnsContainer={categoriesContainer} {setUnsavedChanges} />
  <Button class="self-start" color="primary" on:click={update}
    >{loading ? "Zapisywanie..." : "Aktualizuj kolejność"}</Button
  >
</ScreenCard>
