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
  let notification_threshold: Tables<"product">["notification_threshold"] = 0;
  let steps: [number, number, number] = [1, 5, 10];
  let unit: Tables<"product">["unit"] = "kg";

  currentCompanyId.subscribe((id) => id && (company_id = id));

  const update = async () => {
    // TODO - handle error when request fails
    genericUpdate(
      supabase.from("product").insert({
        name,
        unit,
        steps,
        company_id,
      }),
      {
        setLoading: (x) => (loading = x),
        onSuccess: "/products",
      }
    );
  };
</script>

<ScreenCard header={"Dodaj Produkt"}>
  <form on:submit|preventDefault={update}>
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" required bind:value={name} />
    </Label>
    <Label class="mt-2 space-y-2">
      <Span>Jednostka</Span>
      <Input type="text" name="unit" required bind:value={unit} />
    </Label>
    <Label class="mt-2 space-y-2">
      <Span>Próg powiadomień</Span>
      <div class="flex flex-row gap-4">
        <Input type="text" name="steps" required bind:value={notification_threshold} />
      </div>
    </Label>
    <Label class="mt-2 space-y-2">
      <Span>Step</Span>
      <div class="flex flex-row gap-4">
        <Input type="text" name="steps" required bind:value={steps[0]} />
        <Input type="text" name="steps" required bind:value={steps[1]} />
        <Input type="text" name="steps" required bind:value={steps[2]} />
      </div>
    </Label>
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie..." : "Dodaj produkt"}</Button
    >
  </form>
</ScreenCard>
