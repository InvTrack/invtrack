<script lang="ts">
  import { getPaginationRange, type Tables, type Views } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import {
    Button,
    Heading,
    Pagination,
    PaginationItem,
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
  import { supabase } from "$lib/supabase.js";
  import { currentCompanyId } from "$lib/store";

  let records: { date: Tables<"inventory">["date"]; record_view: Views<"record_view">[] }[] = [];
  let maxTableLength = 0;
  let currentPage = 0;
  let company_id: number | null;

  currentCompanyId.subscribe((id) => {
    if (id) {
      company_id = id;
    }
  });

  const getRecords = (page: number, movement: "next" | "previous" | "first") => {
    let range = getPaginationRange(currentPage, 10);
    console.log(company_id);
    if (movement !== "first" && range[0] > maxTableLength) {
      currentPage -= 1;
      getRecords(currentPage, movement);
      return;
    }
    genericGet(
      supabase
        .from("inventory")
        .select(`date, record_view (*)`, { count: "exact", head: false })
        .eq("company_id", company_id)
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
      }
    );
  };
  const downloadCsv = async () => {
    const { data: csv } = await supabase.functions.invoke("csv-export");
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
  };
  onMount(() => {
    getRecords(currentPage, "first");
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

<Button class="mb-4" color="primary" on:click={() => downloadCsv()}>pobierz</Button>
<ScreenCard header="Overview" class="max-h-152 overflow-y-auto relative px-8 pb-8 pt-0">
  <div class="flex justify-between pt-8">
    <PaginationItem class="mb-4" on:click={handlePrev}>
      <ArrowLeftSolid class="w-5 h-5" />
      <Heading tag="h6" class="ml-4">Poprzedni</Heading>
    </PaginationItem>
    <PaginationItem class="mb-4" on:click={handleNext}>
      <Heading tag="h6" class="mr-4">Następny</Heading>
      <ArrowRightSolid class="w-5 h-5" />
    </PaginationItem>
  </div>
  {#if records}
    <Table divClass="relative" class="border-separate">
      <TableHead theadClass="sticky top-0">
        <TableHeadCell class="" />
        {#each records as record}
          <TableHeadCell class="border-l place-items-center"
            >{parseISODatestring(record.date)}</TableHeadCell
          >
        {/each}
      </TableHead>
      {#if records[0]}
        <TableBody>
          {#each records[0].record_view as product, i}
            <TableBodyRow>
              <TableBodyCell>{product.name}</TableBodyCell>
              {#each records as record}
                <TableBodyCell>{record.record_view[i].quantity}</TableBodyCell>
              {/each}
            </TableBodyRow>
          {/each}
        </TableBody>
      {/if}
    </Table>
  {/if}
</ScreenCard>
