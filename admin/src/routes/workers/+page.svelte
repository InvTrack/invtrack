<script lang="ts">
  import { onMount } from "svelte";
  import type { AuthSession } from "@supabase/supabase-js";
  import { supabase } from "../../lib/supabase";
  import type { Tables } from "$lib/helpers";

  export let session: AuthSession;

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
  <div class="relative overflow-x-auto">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3"> Name </th>
          <th scope="col" class="px-6 py-3"> Admin </th>
          <th scope="col" class="px-6 py-3"> Created at </th>
          <th scope="col" class="px-6 py-3" />
        </tr>
      </thead>
      <tbody>
        {#each workers as worker}
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
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
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
