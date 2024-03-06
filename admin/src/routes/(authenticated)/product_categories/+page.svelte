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

  export let data;
  let { productCategories } = data;
</script>

<ScreenCard header="Produkty">
  {#if productCategories}
    <Table>
      <TableHead>
        <TableHeadCell>Nazwa</TableHeadCell>
        <!-- <TableHeadCell>Jednostka</TableHeadCell>
        <TableHeadCell>Data utworzenia</TableHeadCell>
        <TableHeadCell>Step</TableHeadCell> -->
        <TableHeadCell />
      </TableHead>
      <TableBody>
        {#each productCategories as category}
          <TableBodyRow>
            <TableBodyCell>
              {category.name}
            </TableBodyCell>
            <!-- <TableBodyCell>
              {product.unit}
            </TableBodyCell>
            <TableBodyCell>
              {parseISODatestring(product.created_at)}
            </TableBodyCell>
            <TableBodyCell>
              {product.steps.map((step) => " " + step)}
            </TableBodyCell> -->
            <TableBodyCell>
              <Button class="hover:underline" href={`/product_categories/${category.id}`}
                >Edytuj</Button
              >
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
  <Button class="hover:underline" href={`/product_categories/add`}>Dodaj</Button>
</ScreenCard>
