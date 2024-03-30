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
  let { recipes } = data;
</script>

<ScreenCard header="Recepturownik">
  <Table>
    <TableHead class="bg-gray-200" theadClass="bg-gray-200">
      <TableHeadCell>Nazwa</TableHeadCell>
      <TableHeadCell />
    </TableHead>
    <TableBody>
      {#each recipes as recipe}
        <TableBodyRow>
          <TableBodyCell>
            {recipe.name}
          </TableBodyCell>
          <TableBodyCell>
            <Button class="hover:underline" href={`/recipes/${recipe.id}`}>Edytuj</Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
  <div class="flex mt-2 gap-4">
    <Button class="hover:underline" href={`/products/add`}>Dodaj</Button>
  </div>
</ScreenCard>
