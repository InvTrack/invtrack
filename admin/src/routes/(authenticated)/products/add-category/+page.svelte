<script lang="ts">
  import type { Tables } from "$lib/helpers";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import { currentCompanyId } from "$lib/store";

  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);

  let loading = false;

  let company_id: number | null;
  let name: Tables<"product">["name"] = "";

  currentCompanyId.subscribe((id) => id && (company_id = id));

  const update = async () => {
    // TODO - handle error when request fails
    genericUpdate(
      supabase.from("product_category").insert({
        name,
        company_id,
      }),
      {
        setLoading: (x) => (loading = x),
        onSuccess: "/products/reorder",
      }
    );
  };
</script>

<ScreenCard header={"Dodaj Kategorię"}>
  <form on:submit|preventDefault={update} class="xl:min-w-128 w-10/12 md:min-w-[22rem]">
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" required bind:value={name} class="w-11/12" />
    </Label>
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie..." : "Dodaj kategorię"}</Button
    >
  </form>
</ScreenCard>
