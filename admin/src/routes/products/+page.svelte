<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";

  import { genericGet } from "$lib/genericGet";
  import { Table, TableBody, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";

  let products: Tables<"product">[] | null = null;
  onMount(() => genericGet(supabase.from("product").select("*"), (x) => (products = x)));
</script>

<ScreenCard header="Products">
  {#if products}
    <Table striped>
      <TableHead class="dark:bg-gray-700 bg-gray-50">
        <TableHeadCell scope="col" class="px-6 py-3">Name</TableHeadCell>
        <TableHeadCell scope="col" class="px-6 py-3">Unit</TableHeadCell>
        <TableHeadCell scope="col" class="px-6 py-3">Created at</TableHeadCell>
        <TableHeadCell scope="col" class="px-6 py-3">Steps</TableHeadCell>
        <TableHeadCell scope="col" class="px-6 py-3" />
      </TableHead>
      <TableBody>
        {#each products as product}
          <TableBodyRow>
            <TableHeadCell scope="row" class="px-6 py-4 font-medium  whitespace-nowrap ">
              {product.name}
            </TableHeadCell>
            <td class="px-6 py-4">
              {product.unit}
            </td>
            <td class="px-6 py-4">
              {parseISODatestring(product.created_at)}
            </td>
            <td class="px-6 py-4">
              {product.steps.map((step) => " " + step)}
            </td>
            <td class="px-6 py-4 text-right">
              <a
                href={"/products/" + product.id}
                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a
              >
            </td>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</ScreenCard>
