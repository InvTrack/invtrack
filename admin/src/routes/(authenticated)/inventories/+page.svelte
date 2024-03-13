<script lang="ts">
  import { onMount } from "svelte";
  import type { Tables } from "$lib/helpers";

  import { genericGet } from "$lib/genericGet";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import {
    Button,
    Table,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";

  export let data;
  let { inventories } = data;
</script>

<ScreenCard header="Inwentaryzacje">
  {#if inventories}
    <Table>
      <TableHead class="bg-gray-200" theadClass="bg-gray-200">
        <TableHeadCell>Nazwa</TableHeadCell>
        <TableHeadCell>Data</TableHeadCell>
        <TableHeadCell>Data utworzenia</TableHeadCell>
        <TableHeadCell />
      </TableHead>
      <tbody>
        {#each inventories as inventory}
          <TableBodyRow>
            <TableBodyCell>
              {inventory.name}
            </TableBodyCell>
            <TableBodyCell>
              {parseISODatestring(inventory.date)}
            </TableBodyCell>
            <TableBodyCell>
              {parseISODatestring(inventory.created_at)}
            </TableBodyCell>
            <TableBodyCell>
              <Button class="hover:underline" href={`/inventories/${inventory.id}`}>Edytuj</Button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </tbody>
    </Table>
  {/if}
</ScreenCard>
