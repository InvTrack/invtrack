<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";
  import Head from "$lib/table/Head.svelte";
  import Table from "$lib/table/Table.svelte";
  import Row from "$lib/table/Row.svelte";
  import Card from "$lib/main/Card.svelte";
  import { genericGet } from "$lib/genericGet";

  let inventories: Tables<"inventory">[] | null = null;
  onMount(() => genericGet(supabase.from("inventory").select(), (x) => (inventories = x)));
</script>

<Card name="Inventories">
  {#if inventories}
    <Table>
      <Head>
        <th scope="col" class="px-6 py-3">Name</th>
        <th scope="col" class="px-6 py-3">Date</th>
        <th scope="col" class="px-6 py-3">Created at</th>
        <th scope="col" class="px-6 py-3" />
      </Head>
      <tbody>
        {#each inventories as inventory}
          <Row>
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {inventory.name}
            </th>
            <td class="px-6 py-4">
              {inventory.date}
            </td>
            <td class="px-6 py-4">
              {inventory.created_at}
            </td>
            <td class="px-6 py-4 text-right">
              <a
                href={"/inventories/" + inventory.id}
                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a
              >
            </td>
          </Row>
        {/each}
      </tbody>
    </Table>
  {/if}
</Card>
