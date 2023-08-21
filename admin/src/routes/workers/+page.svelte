<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Enums, Tables, Views } from "$lib/helpers";
  import Head from "$lib/table/Head.svelte";
  import Table from "$lib/table/Table.svelte";
  import Row from "$lib/table/Row.svelte";
  import Card from "$lib/main/Card.svelte";
  import { genericGet } from "$lib/genericGet";
  import { genericUpdate } from "$lib/genericUpdate";
  import SubmitButton from "$lib/form/SubmitButton.svelte";
  import TextInput from "$lib/form/TextInput.svelte";

  let loading = false;
  let workers: Tables<"worker">[] | null = null;
  let company_id: Views<"current_company_id">["id"];

  onMount(() => {
    genericGet(supabase.from("worker").select(), (x) => (workers = x));
    genericGet(supabase.from("current_company_id").select().single(), (x) => (company_id = x.id));
  });

  let name: Tables<"worker">["name"] = null;
  let is_admin: Tables<"worker">["is_admin"] = false;

  const update = () =>
    genericUpdate(
      supabase
        .from("worker")
        .update({
          is_admin,
          name,
        })
        .eq("company_id", company_id),
      "/workers",
      (x) => (loading = x)
    );
</script>

<Card header="Workers">
  <Table>
    <Head>
      <th scope="col" class="px-6 py-3">Name</th>
      <th scope="col" class="px-6 py-3">Admin</th>
      <th scope="col" class="px-6 py-3" />
    </Head>
    <tbody>
      <Row>
        <th>
          <TextInput name="name" bind:value={name}>Name</TextInput>
        </th>
        <td>
          <input type="checkbox" bind:checked={is_admin} />
        </td>
        <td class="flex-1" />
      </Row>
      <SubmitButton>{loading ? "Saving ..." : "Add"}</SubmitButton>
    </tbody>
  </Table>
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
            <td class="px-6 py-4 text-right">
              <a href="/" class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >Edit</a
              >
            </td>
          </Row>
        {/each}
      </tbody>
    </Table>
  {/if}
</Card>
