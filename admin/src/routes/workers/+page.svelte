<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Enums, Tables, Views } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import { genericUpdate } from "$lib/genericUpdate";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import {
    Button,
    Checkbox,
    Input,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
  } from "flowbite-svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";

  let loading = false;
  let workers: Tables<"worker">[] | null = null;
  let company_id: Views<"current_company_id">["id"];

  onMount(() => {
    genericGet(supabase.from("worker").select(), (x) => (workers = x));
    genericGet(supabase.from("current_company_id").select().single(), (x) => (company_id = x.id));
  });

  let name: Tables<"worker">["name"] = null;
  let is_admin: Tables<"worker">["is_admin"] = false;
  supabase.auth.getUser().then((x) => console.log(x));
  const update = () => {};
  // genericUpdate((
  //   supabase
  //     .from("worker")
  //     .insert({
  //       is_admin,
  //       name,
  //       company_id,
  //     })
  //     .eq("company_id", company_id),
  //   "/workers",
  //   (x) => (loading = x)
  // );)
</script>

<ScreenCard header="Workers">
  {#if workers}
    <Table>
      <TableHead>
        <th scope="col" class="px-6 py-3">Name</th>
        <th scope="col" class="px-6 py-3">Admin</th>
        <th scope="col" class="px-6 py-3">Created at</th>
        <th scope="col" class="px-6 py-3" />
      </TableHead>
      <TableBody>
        <TableBodyRow>
          <TableBodyCell
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            <Input name="name" bind:value={name} size="sm" class="w-64" />
          </TableBodyCell>
          <TableBodyCell class="px-6 py-4">
            <Checkbox bind:checked={is_admin} />
          </TableBodyCell>
          <TableBodyCell class="px-6 py-4"
            >{parseISODatestring(new Date(Date.now()).toISOString())}</TableBodyCell
          >
          <TableBodyCell class="px-6 py-4 text-right">
            <Button class="hover:underline" type="submit" on:click={update}>Add</Button>
          </TableBodyCell>
        </TableBodyRow>
        {#each workers as worker}
          <TableBodyRow>
            <TableBodyCell
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {worker.name}
            </TableBodyCell>
            <TableBodyCell class="px-6 py-4">
              {worker.is_admin}
            </TableBodyCell>
            <TableBodyCell class="px-6 py-4">
              {parseISODatestring(worker.created_at)}
            </TableBodyCell>
            <TableBodyCell class="px-6 py-4 text-right">
              <Button class="hover:underline" href={`/workers/${worker.id}`}>Edit</Button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</ScreenCard>
