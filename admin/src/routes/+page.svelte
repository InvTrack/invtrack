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
  import { onMount, tick } from "svelte";
  import { supabase } from "$lib/supabase.js";
  import { get } from "svelte/store";

  let records: { date: Tables<"inventory">["date"]; record_view: Views<"record_view">[] }[] = [];
  $: page = 0;
  $: range = getPaginationRange(page, 10);

  const getRecords = () =>
    genericGet(
      supabase
        .from("inventory")
        .select(`date, record_view (*)`)
        .range(...range)
        .order("date"),
      (x) => (records = x)
    );

  onMount(() => {
    getRecords();
  });

  const handleNext = async () => {
    // if (inventories.length <= range[1] - range[0]) return;
    page += 1;
    getRecords();
  };

  const handlePrev = async () => {
    if (page === 0) return;
    page -= 1;
    getRecords();
  };
  $: console.log(records);
</script>

<ScreenCard header="Overview">
  <Pagination icon on:next={handleNext} on:previous={handlePrev}>
    <svelte:fragment slot="prev">
      <span class="sr-only">Previous</span>
      <Icon name="chevron-left-outline" class="w-2.5 h-2.5" />
    </svelte:fragment>
    <svelte:fragment slot="next">
      <span class="sr-only">Next</span>
      <Icon name="chevron-right-outline" class="w-2.5 h-2.5" />
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
