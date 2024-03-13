<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import type { Tables } from "$lib/helpers";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import { currentCompanyId } from "$lib/store";

  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);

  let navigateTo: URL | undefined = undefined;
  let loading = false;
  let unsavedChanges = false;
  let unsavedChangesModal = false;

  let company_id: number | null;
  let name: Tables<"product">["name"] = "";

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

  const update = async () => {
    // TODO - handle error when request fails
    genericUpdate(
      supabase.from("product_category").insert({
        name,
        company_id,
      }),
      {
        setLoading: (x) => (loading = x),
        onSuccess: "/products",
      }
    );
  };
</script>

<ScreenCard header={"Dodaj Kategorię"}>
  <form on:submit|preventDefault={update}>
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" required bind:value={name} />
    </Label>
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie..." : "Dodaj produkt"}</Button
    >
  </form>
</ScreenCard>
