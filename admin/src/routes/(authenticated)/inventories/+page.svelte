<script lang="ts">
  import { onMount } from "svelte";
  import type { Tables } from "$lib/helpers";

  import { genericGet } from "$lib/genericGet";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import {
    Button,
    Table,
    TableBody,
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
    <Table shadow>
      <TableHead class="bg-primary-100 normal-case dark:bg-gray-600">
        <TableHeadCell>Nazwa</TableHeadCell>
        <TableHeadCell>Data</TableHeadCell>
        <TableHeadCell>Data utworzenia</TableHeadCell>
        <TableHeadCell />
      </TableHead>
      <TableBody>
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
      </TableBody>
    </Table>
  {/if}
</ScreenCard>
