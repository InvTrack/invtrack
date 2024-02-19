<script lang="ts">
  import { page } from "$app/stores";
  import { beforeNavigate, goto } from "$app/navigation";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Label, Span, Input, Button } from "flowbite-svelte";
  import { CloseCircleSolid } from "flowbite-svelte-icons";
  import UnsavedWarningModal from "$lib/modals/UnsavedWarningModal.svelte";
  import ErrorModal from "$lib/modals/ErrorModal.svelte";
  import { currentCompanyId } from "$lib/store";

  export let data;
  let { supabase, product } = data;
  $: ({ supabase } = data);
  $: name = product.name;
  $: unit = product.unit;
  $: steps = product.steps;
  $: notificationThreshold = product.notification_threshold;

  let barcodes: string[] = product.barcode.map((b) => b.code);
  let company_id: number;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  let navigateTo: URL | undefined = undefined;
  let loading = false;
  let unsavedChanges = false;
  let unsavedChangesModal = false;
  let barcodeErrorModal = false;
  const id = $page.params.id;

  beforeNavigate(({ cancel, to }) => {
    if (!unsavedChanges) {
      return;
    }
    cancel();
    unsavedChangesModal = true;
    navigateTo = to?.url;
    return;
  });

  let newBarcode: string | null = null;
  let newBarcodes: string[] = [];
  let deleteBarcodes: string[] = [];

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

  const onUnsavedWarningContinue = () => {
    unsavedChanges = false;
    unsavedChangesModal = false;
    if (navigateTo) {
      goto(navigateTo);
    }
  };
  const onFormChange = () => {
    if (newBarcode) {
      unsavedChanges = false;
      return;
    }
    unsavedChanges = true;
  };
</script>

{#if product}
  <ScreenCard header={"Produkt - " + product.name}>
    <UnsavedWarningModal
      bind:open={unsavedChangesModal}
      onContinue={onUnsavedWarningContinue}
      onStay={() => (unsavedChangesModal = false)}
    />
    <ErrorModal
      open={barcodeErrorModal}
      message="Nie udało się dodać kodu - już istnieje dla tego lub innego produktu"
      confirmText="OK"
      onConfirm={() => {
        barcodeErrorModal = false;
      }}
    />
    <form on:submit|preventDefault={update} on:change={onFormChange}>
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
      <div class="space-y-2 mt-2">
        <Span>Kody</Span>
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 place-items-start gap-4">
            <div class="col-span-2 flex gap-4 w-full">
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
                class="h-fit focus:ring-0 focus:border-gray-300 focus:dark:border-gray-600"
                required
                bind:value={barcodes[i]}
              >
                <CloseCircleSolid slot="right" on:click={() => deleteBarcode(i)} />
              </Input>
            {/each}
          </div>
        </div>
      </div>
      <Button type="submit" class="mt-4" color="primary"
        >{loading ? "Zapisywanie..." : "Aktualizuj produkt"}</Button
      >
    </form>
  </ScreenCard>
{/if}
