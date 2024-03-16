<script lang="ts">
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

  export let data;
  let { categories, uncategorisedProducts } = data;
</script>

<ScreenCard header="Produkty">
  {#if categories}
    <Table>
      <TableHead class="bg-gray-200" theadClass="bg-gray-200">
        <TableHeadCell>Nazwa</TableHeadCell>
        <TableHeadCell>Jednostka</TableHeadCell>
        <TableHeadCell>Data utworzenia</TableHeadCell>
        <TableHeadCell>Step</TableHeadCell>
        <TableHeadCell />
      </TableHead>
      <TableBody>
        {#each categories.filter((c) => c.items.length > 0) as category}
          <TableBodyRow>
            <TableBodyCell class="h-1" tdClass="h-1">
              {category.name}
            </TableBodyCell>
          </TableBodyRow>
          {#each category.items as product}
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
                <Button class="hover:underline" href={`/products/${product.id}`}>Edytuj</Button>
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        {/each}
        {#if uncategorisedProducts && uncategorisedProducts.length > 0}
          <TableBodyRow>
            <TableBodyCell class="h-1" tdClass="h-1">Brak kategorii</TableBodyCell>
          </TableBodyRow>
          {#each uncategorisedProducts as product}
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
                <Button class="hover:underline" href={`/products/${product.id}`}>Edytuj</Button>
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  {/if}
  <div class="flex mt-2 gap-4">
    <Button class="hover:underline" href={`/products/add`}>Dodaj</Button>
    <Button class="hover:underline" href={`/products/reorder`}>Zmień kolejność</Button>
  </div>
</ScreenCard>
