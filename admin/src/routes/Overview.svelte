<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";

  let inventories: Tables<"inventory">[] | null = null;
  let products: (Tables<"product"> & { product_record: Tables<"product_record">[] })[] | null =
    null;

  onMount(() => {
    genericGet(supabase.from("inventory").select(), (x) => {
      console.log(x);
      inventories = x;
    });

    genericGet(supabase.from("product").select(`*, product_record (*)`), (x) => {
      console.log(x);
      products = x;
    });
  });
</script>

<h1 class="ml-10 mt-10 text-4xl dark:text-white">Overview</h1>
{#if inventories && products}
  <div class="bg-white mx-10 my-10 relative border overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-l text-gray-700 uppercase dark:text-gray-400">
        <tr class="border-b divide-x">
          <th scope="col" class="inventory bg-gray-50 dark:bg-gray-800" />
          {#each inventories as inventory}
            <th scope="col" class="inventory py-6 bg-gray-50 dark:bg-gray-800"
              >{inventory.date.split("T")[0]}</th
            >
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each products as product}
          <tr class="border-b divide-x border-gray-200 dark:border-gray-700">
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
              >{product.name}</th
            >
            {#each product.product_record as record}
              <td class="px-6 py-4">{record.quantity} {product.unit}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .inventory {
    writing-mode: vertical-rl;
  }
</style>
