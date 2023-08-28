<script lang="ts">
  import { getPaginationRange, type Tables } from "$lib/helpers";
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

  let inventories: Tables<"inventory">[] = [];
  let products: (Tables<"product"> & { product_record: Tables<"product_record">[] })[] = [];
  let page = 0;
  $: range = getPaginationRange(page, 10);

  onMount(() => {
    genericGet(
      supabase
        .from("inventory")
        .select()
        .range(...range),
      (x) => (inventories = x)
    );

    genericGet(
      supabase
        .from("product")
        .select(`*, product_record (*)`)
        .range(...range, {
          foreignTable: "product_record",
        }),
      (x) => (products = x)
    );
  });
  const handleNext = async () => {
    page += 1;
  };
  const handlePrev = () => {
    page -= 1;
  };
</script>

<ScreenCard header="Overview">
  <Pagination icon>
    <svelte:fragment slot="prev">
      <span class="sr-only">Previous</span>
      <Icon name="chevron-left-outline" class="w-2.5 h-2.5" on:click={handlePrev} />
    </svelte:fragment>
    <svelte:fragment slot="next">
      <span class="sr-only">Next</span>
      <Icon name="chevron-right-outline" class="w-2.5 h-2.5" on:click={handleNext} />
    </svelte:fragment>
  </Pagination>
  {#if inventories && products}
    <!-- <div class="bg-white mx-10 my-10 relative border overflow-x-auto shadow-md sm:rounded-lg"> -->
    <Table>
      <TableHead>
        <TableHeadCell scope="col" />
        {#each inventories as inventory}
          <TableHeadCell scope="col" class="p-4 place-items-center border-l"
            >{parseISODatestring(inventory.date)}</TableHeadCell
          >
        {/each}
      </TableHead>

      <TableBody>
        {#each products as product}
          <TableBodyRow class="border-b divide-x border-gray-200 dark:border-gray-700">
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
              >{product.name}</th
            >
            {#each product.product_record as record}
              <TableBodyCell>{record.quantity} {product.unit}</TableBodyCell>
            {/each}
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</ScreenCard>
