<svelte:options accessors />

<script lang="ts">
  import Tooltip from "$lib/Tooltip.svelte";
  import { genericUpdate } from "$lib/genericUpdate";
  import type { PatchedDatabase } from "$lib/helpers";
  import ErrorModal from "$lib/modals/ErrorModal.svelte";
  import type { SupabaseClient } from "@supabase/supabase-js";
  import { Button, Input, Span } from "flowbite-svelte";
  import { CloseCircleSolid } from "flowbite-svelte-icons";

  export let unsavedChanges: boolean;
  export let barcodes: string[];
  let newBarcodes: string[] = [];
  let deleteBarcodes: string[] = [];
  export let newBarcode: string | null = null;

  let barcodeErrorModal = false;

  const addBarcode = () => {
    if (!newBarcode) return;
    if (barcodes.find((v) => v === newBarcode) || newBarcodes.find((v) => v === newBarcode)) {
      barcodeErrorModal = true;
      return;
    }
    barcodes = [...barcodes, newBarcode];
    newBarcodes = [...newBarcodes, newBarcode];
    newBarcode = null;
    unsavedChanges = true;
  };

  const deleteBarcode = (barcodeIndex: number) => {
    unsavedChanges = true;
    deleteBarcodes = [...deleteBarcodes, barcodes[barcodeIndex]];
    barcodes = barcodes.filter((_, i) => i !== barcodeIndex);
  };

  export const submit = (
    supabase: SupabaseClient<PatchedDatabase>,
    setLoading: (x: boolean) => void,
    company_id: number,
    product_id: number
  ) => {
    if (newBarcodes) {
      newBarcodes.forEach((newBarcode) => {
        genericUpdate(
          supabase.from("barcode").insert({ code: newBarcode, company_id, product_id }),
          {
            setLoading,
            onError: () => (barcodeErrorModal = true),
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
            setLoading,
          }
        );
      });
      // TODO - handle error when request fails
      deleteBarcodes = [];
    }
  };
</script>

<div class="mt-2 space-y-2">
  <ErrorModal
    open={barcodeErrorModal}
    message="Nie udało się dodać kodu - już istnieje dla tego lub innego produktu"
    confirmText="OK"
    onConfirm={() => (barcodeErrorModal = false)}
  />
  <div class="flex flex-col gap-4">
    <Span class="flex flex-row"
      >Kody <Tooltip id="alias-ttip">
        <div class="space-y-2 p-3">
          <h3 class="font-semibold text-gray-900 dark:text-white">Kody - co to?</h3>
          Większość produktów posiada na opakowaniach kody kreskowe/qr. Możesz zobaczyć/edytować kody
          wprowadzone w aplikacji przez pracowników.
          <br />
          <strong class="text-gray-900 dark:text-white">
            Mimo tego, że można robić to tutaj, zalecamy wprowadzać kody w aplikacji.
          </strong>
        </div>
      </Tooltip></Span
    >
    <div class="grid grid-cols-2 place-items-start gap-4">
      <div class="col-span-2 flex w-full gap-4">
        <Input
          type="text"
          name="steps"
          placeholder="Dodaj nowy kod"
          class="h-min w-full"
          bind:value={newBarcode}
        />
        <Button color="primary" class="shrink-0" on:click={addBarcode}>Dodaj kod</Button>
      </div>
      {#each barcodes as _barcode, i}
        <Input
          type="text"
          name="steps"
          readonly
          class="h-fit focus:border-gray-300 focus:ring-0 focus:dark:border-gray-600"
          required
          bind:value={barcodes[i]}
        >
          <CloseCircleSolid slot="right" on:click={() => deleteBarcode(i)} />
        </Input>
      {/each}
    </div>
  </div>
</div>
