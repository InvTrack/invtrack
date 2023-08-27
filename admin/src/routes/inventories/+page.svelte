<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";

  import { genericGet } from "$lib/genericGet";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Button, Table, TableBodyRow, TableHead } from "flowbite-svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";

  let inventories: Tables<"inventory">[] | null = null;
  onMount(() =>
    genericGet(
      supabase.from("inventory").select().order("date", { ascending: false }),
      (x) => (inventories = x)
    )
  );
</script>

<ScreenCard header="Inventories">
  {#if inventories}
    <Table>
      <TableHead>
        <th scope="col" class="px-6 py-3">Name</th>
        <th scope="col" class="px-6 py-3">Date</th>
        <th scope="col" class="px-6 py-3">Created at</th>
        <th scope="col" class="px-6 py-3" />
      </TableHead>
      <tbody>
        {#each inventories as inventory}
          <TableBodyRow>
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {inventory.name}
            </th>
            <td class="px-6 py-4">
              {parseISODatestring(inventory.date)}
            </td>
            <td class="px-6 py-4">
              {parseISODatestring(inventory.created_at)}
            </td>
            <td class="px-6 py-4 text-right">
              <Button class="hover:underline" href={`/inventories/${inventory.id}`}>Edit</Button>
            </td>
          </TableBodyRow>
        {/each}
      </tbody>
    </Table>
  {/if}
</ScreenCard>
