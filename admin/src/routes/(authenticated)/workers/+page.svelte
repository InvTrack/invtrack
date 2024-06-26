<script lang="ts">
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
  let { workers } = data;
</script>

<ScreenCard header="Pracownicy">
  {#if workers}
    <Table shadow>
      <TableHead class="bg-primary-100 normal-case">
        <TableHeadCell>Imię</TableHeadCell>
        <TableHeadCell>E-mail</TableHeadCell>
        <TableHeadCell>Admin</TableHeadCell>
        <TableHeadCell>Data utworzenia</TableHeadCell>
        <TableHeadCell />
      </TableHead>
      <TableBody>
        <!-- TODO: implement filtering -->
        <!-- <TableBodyRow>
          <TableBodyCell>
            <Input name="name" bind:value={name} size="sm" class="w-64" />
          </TableBodyCell>
          <TableBodyCell />
          <TableBodyCell>
            <Checkbox bind:checked={is_admin} />
          </TableBodyCell>
          <TableBodyCell>{parseISODatestring(new Date(Date.now()).toISOString())}</TableBodyCell>
          <TableBodyCell class="px-6 py-4 text-right">
            <Button class="hover:underline" type="submit" on:click={update}>Edit</Button>
          </TableBodyCell>
        </TableBodyRow> -->
        {#each workers as worker}
          <TableBodyRow>
            <TableBodyCell>
              {worker.name}
            </TableBodyCell>
            <TableBodyCell>
              {worker.email}
            </TableBodyCell>
            <TableBodyCell>
              {worker.is_admin ? "Tak" : "Nie"}
            </TableBodyCell>
            <TableBodyCell>
              {parseISODatestring(worker.created_at)}
            </TableBodyCell>
            <TableBodyCell class="px-6 py-4 text-right">
              <Button class="hover:underline" href={`/workers/${worker.id}`}>Edytuj</Button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
  <Button class="mt-5 hover:underline" href={`/workers/add`}>Dodaj</Button>
</ScreenCard>
