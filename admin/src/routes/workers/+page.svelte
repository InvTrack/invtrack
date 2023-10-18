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
  import { Chart, A, Dropdown, DropdownItem } from "flowbite-svelte";
  import {
    ArrowUpSolid,
    ChevronDownSolid,
    ChevronRightSolid,
    CloseSolid,
    UserGroupSolid,
  } from "flowbite-svelte-icons";

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

  const options: ApexCharts.ApexOptions = {
    series: [
      {
        // primary-500
        name: "Średni czas inwentaryzacji",
        color: "#3498DB",
        data: ["35", "41", "45", "55", "50", "55"],
      },
    ],
    chart: {
      sparkline: {
        enabled: false,
      },
      type: "bar",
      width: "100%",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    fill: {
      opacity: 1,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          cssClass: "text-xs font-normal fill-gray-700 dark:fill-gray-400",
        },
        formatter: (value) => value + " min",
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    xaxis: {
      labels: {
        show: true,
        style: {
          cssClass: "text-xs font-normal fill-gray-700 dark:fill-gray-400",
        },
        formatter: (value) =>
          ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec"][value - 1],
      },
    },
    grid: {
      show: true,
      strokeDashArray: 10,
      padding: {
        left: 8,
        right: 0,
        top: 0,
      },
    },
  };

  const options2: ApexCharts.ApexOptions = {
    colors: ["#1A56DB", "#FDBA8C"],
    series: [
      {
        name: "Adam",
        color: "#1A56DB",
        data: [
          { x: "Styczeń", y: 30 },
          { x: "Luty", y: 40 },
          { x: "Marzec", y: 36},
          { x: "Kwiecień", y: 42 },
          { x: "Maj", y: 29 },
          { x: "Czerwiec", y: 35 },
        ],
      },
      {
        name: "Marek",
        color: "#FDBA8C",
        data: [
          { x: "Styczeń", y:28 },
          { x: "Luty", y:35 },
          { x: "Marzec", y:35 },
          { x: "Kwiecień", y:40 },
          { x: "Maj", y:35 },
          { x: "Czerwiec", y:32 },
        ],
      },
    ],
    chart: {
      type: "bar",
      height: 250,
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadiusApplication: "end",
        borderRadius: 5,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 1,
        },
      },
    },
    stroke: {
      show: true,
      width: 0,
      colors: ["transparent"],
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      floating: false,
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,

      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
        formatter: (value) => value + " min",
      },
    },
    fill: {
      opacity: 1,
    },
    grid: {
      show: true,
      strokeDashArray: 10,
      padding: {
        left: 8,
        right: 0,
        top: -12,
      },
    },
  };
</script>

<div class="flex flex-row justify-between mb-4">
  <ScreenCard class='mt-16'>
    <div class="flex justify-between border-gray-200 border-b dark:border-gray-700 pb-3">
      <dl>
        <dt class="text-base font-normal text-gray-900 dark:text-white pb-1">
          Średni czas inwentaryzacji
        </dt>
        <dd class="leading-none text-3xl font-bold text-gray-900 dark:text-white">45 min</dd>
      </dl>
      <div class="self-end">
        <span
          class="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-green-900 dark:text-green-300"
        >
          <ArrowUpSolid class="w-2.5 h-2.5 mr-1.5" />
          10% względem poprzedniego okresu
        </span>
      </div>
    </div>

    <Chart {options} />
    <div
      class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between"
    >
      <div class="flex justify-between items-center pt-5">
        <Button
          class="text-sm font-medium text-gray-900 dark:text-white hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-transparent dark:focus:ring-transparent py-0"
          >Ostatnie 6 miesięcy<ChevronDownSolid class="w-2.5 m-2.5 ml-1.5" /></Button
        >
        <Dropdown class="w-40" offset={-6}>
          <DropdownItem>Ostatnie 6 miesięcy</DropdownItem>
        </Dropdown>
        <A
          href="/"
          class="uppercase text-sm font-semibold hover:text-primary-700 dark:hover:text-primary-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2 hover:no-underline"
        >
          Raport
          <ChevronRightSolid class="w-2.5 h-2.5 ml-1.5" />
        </A>
      </div>
    </div>
  </ScreenCard>
  <ScreenCard class="flex-1 mt-16">
    <div class="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center">
        <div
          class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3"
        >
          <UserGroupSolid class="w-6 h-6 text-gray-900 dark:text-white" />
        </div>
        <div>
          <p class="text-sm font-normal text-gray-900 dark:text-white">
            Najefektywniejsi pracownicy
          </p>
          <h5 class="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">
            30-40 min
          </h5>
        </div>
      </div>
    </div>
    <Chart options={options2} />
    <div
      class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between"
    >
      <div class="flex justify-between items-center pt-5">
        <Button
          class="text-sm font-medium text-gray-900 dark:text-white hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-transparent dark:focus:ring-transparent py-0"
          >Last 7 days<ChevronDownSolid class="w-2.5 m-2.5 ml-1.5" /></Button
        >
        <Dropdown class="w-40" offset={-6}>
          <DropdownItem>Yesterday</DropdownItem>
          <DropdownItem>Today</DropdownItem>
          <DropdownItem>Last 7 days</DropdownItem>
          <DropdownItem>Last 30 days</DropdownItem>
          <DropdownItem>Last 90 days</DropdownItem>
        </Dropdown>
        <A
          href="/"
          class="uppercase text-sm font-semibold hover:text-primary-700 dark:hover:text-primary-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2 hover:no-underline"
        >
          Leads Report
          <ChevronRightSolid class="w-2.5 h-2.5 ml-1.5" />
        </A>
      </div>
    </div>
  </ScreenCard>
</div>

<ScreenCard header="Pracownicy">
  {#if workers}
    <Table class='overflow-hidden'>
      <TableHead>
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
              Adriana
            </TableBodyCell>
            <TableBodyCell>
              Adriana@example.com
            </TableBodyCell>
            <TableBodyCell class='mx-auto'>
              <CloseSolid  />
            </TableBodyCell>
            <TableBodyCell>
              {parseISODatestring(worker.created_at)}
            </TableBodyCell>
            <TableBodyCell class="px-6 py-4 text-right">
              <Button class="hover:underline" href={`/workers/${worker.id}`}>Edytuj</Button>
            </TableBodyCell>
          </TableBodyRow>
          <TableBodyRow>
            <TableBodyCell>
              Sara
            </TableBodyCell>
            <TableBodyCell>
              sara@example.com
            </TableBodyCell>
            <TableBodyCell class='mx-auto'>
              <CloseSolid  />
            </TableBodyCell>
            <TableBodyCell>
              {parseISODatestring(worker.created_at)}
            </TableBodyCell>
            <TableBodyCell class="px-6 py-4 text-right">
              <Button class="hover:underline" href={`/workers/${worker.id}`}>Edytuj</Button>
            </TableBodyCell>
          </TableBodyRow>
          <TableBodyRow>
            <TableBodyCell>
              Jan
            </TableBodyCell>
            <TableBodyCell>
              jan@example.com
            </TableBodyCell>
            <TableBodyCell class='mx-auto'>
              <CloseSolid  />
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
  <Button class="hover:underline" href={`/workers/add`}>Dodaj</Button>
</ScreenCard>
