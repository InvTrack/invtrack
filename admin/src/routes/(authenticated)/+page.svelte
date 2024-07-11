<script lang="ts">
  import { getPaginationRange, type Tables, type Views } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import {
    Button,
    Heading,
    PaginationItem,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { ArrowLeftSolid, ArrowRightSolid } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import { currentCompanyId } from "$lib/store";

  // supabase client-side client access
  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);

  let records: { date: Tables<"inventory">["date"]; record_view: Views<"record_view">[] }[] = [];
  let productsWithRecords: { name: string; records: (Views<"record_view"> | undefined)[] }[] = [];
  let products: Tables<"product">[] = [];
  let maxTableLength = 0;
  let currentPage = 0;
  let company_id: number | undefined | null;
  let loadingCsv = false;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  let range: [number, number];

  const getRecords = (page: number, movement: "next" | "previous" | "first") => {
    const [start, end] = getPaginationRange(currentPage, 10);
    range = [start, end];

    if (movement !== "first" && range[0] > maxTableLength) {
      currentPage -= 1;
      getRecords(currentPage, movement);
      return;
    }
    genericGet(
      supabase
        .from("inventory")
        .select(`date, record_view (*)`, { count: "exact", head: false })
        .range(...range)
        .order("date"),
      (x, count) => {
        maxTableLength = count ?? 0;
        if (movement === "next" && x.length == 0) {
          currentPage = Math.max(page - 1, 0);
          return;
        }
        if (movement === "previous" && x.length == 0) {
          currentPage = 0;
          return;
        }
        records = x;

        productsWithRecords = products.map((p) => ({
          name: p.name,
          records: x.map((r) => r.record_view.find((rr) => rr.product_id == p.id)),
        }));
      }
    );
  };

  const downloadCsv = async () => {
    loadingCsv = true;
    const { data: csv } = await supabase.functions.invoke("csv-export", {
      body: { company_id },
    });
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", "inventory.csv");
      document.body.appendChild(a);
      a.click();
    }
    loadingCsv = false;
  };
  onMount(() => {
    genericGet(supabase.from("product").select(), (x) => {
      products = x;
      getRecords(currentPage, "first");
    });
  });

  const handleNext = async () => {
    currentPage += 1;
    getRecords(currentPage, "next");
  };

  const handlePrev = async () => {
    if (currentPage === 0) return;
    currentPage -= 1;
    getRecords(currentPage, "previous");
  };
</script>

<main class="flex flex-col">
  <ScreenCard header="Podsumowanie" class="relative w-fit overflow-y-auto p-8 pt-0">
    <div class="flex justify-between pt-8">
      <PaginationItem class="hover:bg-primary-200 mb-4 " on:click={handlePrev}>
        <ArrowLeftSolid class="h-5 w-5" />
        <Heading tag="h6" class="ml-4 ">Poprzedni</Heading>
      </PaginationItem>
      <PaginationItem class="hover:bg-primary-200 mb-4" on:click={handleNext}>
        <Heading tag="h6" class="mr-4">Następny</Heading>
        <ArrowRightSolid class="h-5 w-5" />
      </PaginationItem>
    </div>
    {#if records}
      <Table shadow>
        <TableHead class="bg-primary-100 normal-case dark:bg-gray-600 ">
          <TableHeadCell />
          {#each records as record}
            <TableHeadCell class="place-items-center border-l"
              >{parseISODatestring(record.date)}</TableHeadCell
            >
          {/each}
        </TableHead>
        {#if records[0]}
          <TableBody>
            {#each productsWithRecords as product, i}
              <TableBodyRow>
                <TableBodyCell class="whitespace-normal">{product.name}</TableBodyCell>
                {#each product.records as record}
                  <TableBodyCell class="whitespace-normal">
                    {#if record}
                      {record.quantity} {record.unit}
                    {:else}
                      n/a
                    {/if}
                  </TableBodyCell>
                {/each}
              </TableBodyRow>
            {/each}
          </TableBody>
        {/if}
      </Table>
    {/if}
    <Button
      class="mt-4 h-12 self-end text-lg font-bold"
      color="primary"
      on:click={() => downloadCsv()}
    >
      {#if loadingCsv}
        <Spinner size="8" color="white" />
      {:else}
        Eksportuj dane
      {/if}
    </Button>
  </ScreenCard>
</main>
