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
  let { recipes } = data;
</script>

<ScreenCard header="Recepturownik">
  <Table class="min-w-[48rem]" shadow>
    <TableHead class="bg-primary-100 normal-case">
      <TableHeadCell>Nazwa</TableHeadCell>
      <TableHeadCell>Data utworzenia</TableHeadCell>
      <TableHeadCell />
    </TableHead>
    <TableBody>
      {#each recipes as recipe}
        <TableBodyRow>
          <TableBodyCell>
            {recipe.name}
          </TableBodyCell>
          <TableBodyCell>
            {parseISODatestring(recipe.created_at)}
          </TableBodyCell>
          <TableBodyCell>
            <Button class="hover:underline" href={`/recipes/${recipe.id}`}>Edytuj</Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
  <div class="mt-2 flex gap-4">
    <Button class="hover:underline" href={`/recipes/add`}>Dodaj</Button>
  </div>
</ScreenCard>
