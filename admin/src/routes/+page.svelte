<script lang="ts">
  import { getPaginationRange, type Tables, type Views } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import {
    Pagination,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Icon } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase.js";

  let records: { date: Tables<"inventory">["date"]; record_view: Views<"record_view">[] }[] = [];
  let maxTableLength = 0;
  let currentPage = 0;

  const getRecords = (page: number, movement: "next" | "previous" | "first") => {
    let range = getPaginationRange(currentPage, 10);
    if (movement !== "first" && range[0] > maxTableLength) {
      currentPage -= 1;
      getRecords(currentPage, movement);
      return;
    }
    genericGet(
      supabase
        .from("inventory")
        .select(`date, record_view (*)`, { count: "exact", head: false })
        // .eq("company_id", company_id)
        .range(...range)
        .order("date"),
      (x, count) => {
        maxTableLength = count ?? 0;
        if (movement === "next" && x.length == 0) {
          currentPage = Math.max(currentPage - 1, 0);
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

<ScreenCard header="Overview">
  <Pagination icon class="flex justify-evenly mb-4" on:next={handleNext} on:previous={handlePrev}>
    <svelte:fragment slot="prev">
      <Icon name="arrow-left-solid" class="w-5 h-5" />
      <span class="sr-only">Previous</span>
    </svelte:fragment>
    <svelte:fragment slot="next">
      <span class="sr-only">Next</span>
      <Icon name="arrow-right-solid" class="w-5 h-5" />
    </svelte:fragment>
  </Pagination>
  {#if records}
    <Table>
      <TableHead>
        <TableHeadCell scope="col" />
        {#each records as record}
          <TableHeadCell scope="col" class="p-4 place-items-center border-l"
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
