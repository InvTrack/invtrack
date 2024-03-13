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

<ScreenCard header="Kategorie">
  {#if productCategories}
    <Table>
      <TableHead>
        <TableHeadCell>Nazwa</TableHeadCell>
        <TableHeadCell />
      </TableHead>
      <TableBody>
        {#each productCategories as category}
          <TableBodyRow>
            <TableBodyCell>
              {category.name}
            </TableBodyCell>
            <TableBodyCell>
              <Button class="hover:underline" href={`/product-category/${category.id}`}
                >Edytuj</Button
              >
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
  <Button class="hover:underline" href={`/product-category/add`}>Dodaj</Button>
</ScreenCard>
