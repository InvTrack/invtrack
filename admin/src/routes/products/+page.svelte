<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";

  import { genericGet } from "$lib/genericGet";
  import {
    Button,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";

  let products: Tables<"product">[] | null = null;
  onMount(() => genericGet(supabase.from("product").select("*"), (x) => (products = x)));
</script>

<ScreenCard header="Products">
  {#if products}
    <Table>
      <TableHead>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Unit</TableHeadCell>
        <TableHeadCell>Created at</TableHeadCell>
        <TableHeadCell>Steps</TableHeadCell>
        <TableHeadCell />
      </TableHead>
      <TableBody>
        {#each products as product}
          <TableBodyRow>
            <TableBodyCell>
              {product.name}
            </TableBodyCell>
            <TableBodyCell>
              {product.unit}
            </TableBodyCell>
            <TableBodyCell>
              {parseISODatestring(product.created_at)}
            </TableBodyCell>
            <TableBodyCell>
              {product.steps.map((step) => " " + step)}
            </TableBodyCell>
            <TableBodyCell>
              <Button class="hover:underline" href={`/products/${product.id}`}>Edit</Button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</ScreenCard>
