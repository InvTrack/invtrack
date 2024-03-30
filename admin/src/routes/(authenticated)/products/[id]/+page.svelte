<script lang="ts">
  import { page } from "$app/stores";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import { currentCompanyId } from "$lib/store";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import Barcodes from "./Barcodes.svelte";

  export let data;
  let { supabase, product } = data;
  $: ({ supabase } = data);
  $: name = product.name;
  $: unit = product.unit;
  $: steps = product.steps;
  $: notificationThreshold = product.notification_threshold;

  let newBarcode: string | null = null;
  let barcodes: string[] = product.barcode.map((b) => b.code);
  let newBarcodes: string[] = [];
  let deleteBarcodes: string[] = [];

  let company_id: number;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  let loading = false;
  let unsavedChanges = false;

  let confirmationModal = false;
  let barcodeErrorModal = false;
  const id = $page.params.id;

  const update = async () => {
    // TODO - handle error when request fails
    genericUpdate(
      supabase
        .from("product")
        .update({
          name,
          unit,
          steps,
          notification_threshold: notificationThreshold,
        })
        .eq("id", id),
      { setLoading: (x) => (loading = x) }
    );
    if (newBarcodes) {
      newBarcodes.forEach((newBarcode) => {
        genericUpdate(
          supabase.from("barcode").insert({ code: newBarcode, company_id, product_id: product.id }),
          {
            setLoading: (x) => (loading = x),
            onError: () => {
              barcodeErrorModal = true;
            },
          }
        );
      });
      // TODO - handle error when request fails
      newBarcodes = [];
    }
    if (deleteBarcodes) {
      deleteBarcodes.forEach((barcodeToDelete) => {
        genericUpdate(
          supabase.from("barcode").delete().match({ company_id, code: barcodeToDelete }),
          {
            setLoading: (x) => (loading = x),
          }
        );
      });
      // TODO - handle error when request fails
      deleteBarcodes = [];
    }
    unsavedChanges = false;
  };

  const onFormChange = () => {
    if (newBarcode) {
      unsavedChanges = false;
      return;
    }
    unsavedChanges = true;
  };

  const deleteProduct = () => {
    genericUpdate(
      supabase.from("product").update({ deleted_at: new Date().toISOString() }).eq("id", id),
      {
        onSuccess: "/products",
      }
    );
  };
  const deleteProductConfirmation = () => (confirmationModal = true);
</script>

<ScreenCard header={"Produkt - " + product.name} class="flex flex-col">
  <UnsavedWarningModal bind:unsavedChanges />
  <ConfirmationModal
    bind:open={confirmationModal}
    message="Czy na pewno chcesz usunąć ten produkt?"
    onConfirm={deleteProduct}
  />
  <form on:submit|preventDefault={update} on:change={onFormChange} class="flex-1">
    <Label class="space-y-2">
      <Span>Nazwa</Span>
      <Input type="text" name="name" required bind:value={name} />
    </Label>
    <Label class="space-y-2 mt-2">
      <Span>Jednostka</Span>
      <Input type="text" name="unit" required bind:value={unit} />
    </Label>
    <Label class="space-y-2 mt-2">
      <Span>Próg powiadomień</Span>
      <div class="flex flex-row gap-4">
        <Input type="text" name="steps" required bind:value={notificationThreshold} />
      </div>
    </Label>
    <Label class="space-y-2 mt-2">
      <Span>Step</Span>
      <div class="flex flex-row gap-4">
        <Input type="text" name="steps" required bind:value={steps[0]} />
        <Input type="text" name="steps" required bind:value={steps[1]} />
        <Input type="text" name="steps" required bind:value={steps[2]} />
      </div>
    </Label>
    <Barcodes
      bind:unsavedChanges
      bind:newBarcode
      bind:barcodeErrorModal
      bind:barcodes
      bind:newBarcodes
      bind:deleteBarcodes
    />
    <Button type="submit" class="mt-4" color="primary"
      >{loading ? "Zapisywanie..." : "Aktualizuj produkt"}</Button
    >
  </form>
  <Button type="submit" class="w-fit self-end" color="red" on:click={deleteProductConfirmation}
    >Usuń ten produkt</Button
  >
</ScreenCard>
