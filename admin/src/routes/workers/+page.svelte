<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import type { Tables, Views } from "$lib/helpers";
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

  let loading = false;
  let workers: Tables<"worker">[] | null = null;
  let company_id: Views<"current_company_id">["id"];

  onMount(() => {
    genericGet(supabase.from("current_company_id").select().single(), (x) => {
      company_id = x.id;
      genericGet(supabase.from("worker").select().eq("company_id", x.id), (y) => (workers = y));
    });
  });

  let name: Tables<"worker">["name"] = null;
  let is_admin: Tables<"worker">["is_admin"] = false;
  supabase.auth.getUser().then((x) => console.log(x));
  const update = () => {}; // genericUpdate(
  //   supabase
  //     .from("worker")
  //     .insert({
  //       is_admin,
  //       name,
  //       company_id
  //     })
  //   "/workers",
  //   (x) => (loading = x)
  // );
</script>

<ScreenCard header="Workers">
  {#if workers}
    <Table>
      <TableHead>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Email</TableHeadCell>
        <TableHeadCell>Admin</TableHeadCell>
        <TableHeadCell>Created at</TableHeadCell>
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
              {worker.is_admin}
            </TableBodyCell>
            <TableBodyCell>
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
  <Button class="hover:underline" href={`/workers/add`}>Add</Button>
</ScreenCard>
