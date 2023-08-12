<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables } from "$lib/helpers";
  import Card from "$lib/main/Card.svelte";
  import { genericGet } from "$lib/genericGet";

  let loading = false;
  let product: Tables<"product"> | null = null;
  onMount(() =>
    genericGet(
      supabase.from("product").select().eq("id", $page.params.slug).single(),
      (x) => (product = x)
    )
  );

  //   const updateProfile = async () => {
  //     try {
  //       loading = true;

  //       const updates = {
  //         id: user.id,
  //         username,
  //         website,
  //         avatar_url: avatarUrl,
  //         updated_at: new Date().toISOString(),
  //       };

  //       let { error } = await supabase.from("profiles").upsert(updates);

  //       if (error) {
  //         throw error;
  //       }
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         alert(error.message);
  //       }
  //     } finally {
  //       loading = false;
  //     }
  //   };
</script>

{#if product}
  <Card name={"Product - " + product.name}>
    <form>
      <div class="mb-6">
        <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Name</label
        >
        <input
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          required
          type="text"
          id="name"
          name="name"
          value={product.name}
        />
      </div>
      <div class="mb-6">
        <label for="unit" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Unit</label
        >
        <input
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          required
          type="text"
          id="unit"
          name="unit"
          value={product.unit}
        />
      </div>
      <button
        type="submit"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >Save</button
      >
    </form>
  </Card>
{/if}
