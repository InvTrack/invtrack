<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "../../lib/supabase";
  import type { Tables } from "$lib/helpers";
  import Head from "$lib/table/Head.svelte";
  import Table from "$lib/table/Table.svelte";
  import Row from "$lib/table/Row.svelte";

  let loading = false;
  let workers: Tables<"worker">[] | null = null;

  onMount(() => {
    getProfile();
  });

  const getProfile = async () => {
    try {
      loading = true;

      const { data, error, status } = await supabase.from("worker").select();

      if (error && status !== 406) throw error;

      if (data) {
        workers = data;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      loading = false;
    }
  };
</script>

{#if workers}
  <Table>
    <Head>
      <th scope="col" class="px-6 py-3">Name</th>
      <th scope="col" class="px-6 py-3">Admin</th>
      <th scope="col" class="px-6 py-3">Created at</th>
      <th scope="col" class="px-6 py-3" />
    </Head>
    <tbody>
      {#each workers as worker}
        <Row>
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {worker.name}
          </th>
          <td class="px-6 py-4">
            {worker.is_admin}
          </td>
          <td class="px-6 py-4">
            {worker.created_at}
          </td>
          <td class="px-6 py-4"> Edit </td>
        </Row>
      {/each}
    </tbody>
  </Table>
{/if}
