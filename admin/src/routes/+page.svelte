<script lang="ts">
  import "./styles.css";
  import { getPaginationRange, type Tables, type Views } from "$lib/helpers";
  import { genericGet } from "$lib/genericGet";
  import {
    Heading,
    PaginationItem,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import {
    ChevronRightSolid,
    ChevronDownSolid,
    ArrowLeftSolid,
    ArrowRightSolid,
    DotsHorizontalOutline,
    TrashBinSolid,
    InfoCircleSolid,
    PenSolid,
    DownloadSolid,
    ShareNodesSolid,
  } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase.js";
  import { Chart, A, Button, Dropdown, DropdownItem, Popover } from "flowbite-svelte";

  let records: { date: Tables<"inventory">["date"]; record_view: Views<"record_view">[] }[] = [];
  let maxTableLength = 0;
  let currentPage = 0;

  const getRecords = (page: number, movement: "next" | "previous" | "first") => {
    let range = getPaginationRange(currentPage, 15);
    console.log(range);
    if (movement !== "first" && range[0] > maxTableLength) {
      currentPage -= 1;
      getRecords(currentPage, movement);
      return;
    }
    genericGet(
      supabase
        .from("inventory")
        .select(`date, record_view (*)`, { count: "exact", head: false })
        // .eq("company_id", company_id)
        .range(...range)
        .order("date"),
      (x, count) => {
        maxTableLength = count ?? 0;
        if (movement === "next" && x.length == 0) {
          currentPage = Math.max(page - 1, 0);
          return;
        }
        if (movement === "previous" && x.length == 0) {
          currentPage = 0;
          return;
        }
        records = x;
      }
    );
  };
  onMount(() => {
    getRecords(currentPage, "first");
  });

  const handleNext = async () => {
    currentPage += 1;
    getRecords(currentPage, "next");
  };

  const handlePrev = async () => {
    if (currentPage === 0) return;
    currentPage -= 1;
    getRecords(currentPage, "previous");
  };
  //
  //
  // text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800
  let options: ApexCharts.ApexOptions = {
    chart: {
      height: 300,
      width: "94%",
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: false,
          zoom: false,
          pan: false,
        },
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.7,
        opacityTo: 0.1,
        shade: "#111827",
        gradientToColors: ["#111827"],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 6,
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 16,
        right: 16,
        top: 0,
      },
    },
    series: [
      {
        name: "MDX-20-C-70",
        data: [51, 100, 62, 55, 39, 89, 132],
        // primary-500
        color: "#3498DB",
      },
    ],
    xaxis: {
      categories: [
        "03 Lutego",
        "04 Lutego",
        "05 Lutego",
        "06 Lutego",
        "07 Lutego",
        "08 Lutego",
        "09 Lutego",
      ],
      labels: {
        show: true,
        style:{
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        }
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
        style: {
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
    },
  };
  const options2: ApexCharts.ApexOptions = {
    series: [52.8, 32.8, 23.8, 16.8, 10.4, 5.4].reverse(),
    colors: ["#F47A1F", "#FDBB2F", "#377B2B", "#7AC142", "#6050DC", "#D52DB7"].reverse(),
    chart: {
      height: 330,
      width: "100%",
      type: "pie",
    },
    stroke: {
      colors: ["white"],
      lineCap: "round",
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -25,
        },
      },
    },
    labels: ["MDX-22-C-24", "MDX-22-C-6", "MDX-19-C-0", "MDX-4-C-99", "MDX-25-C-25", "MDX-34-C-26"],
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    legend: {
      show:false,
      horizontalAlign: "left",
      position: "bottom",
      fontFamily: "Inter, sans-serif",
      labels: {
        useSeriesColors: true,
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + "%";
        },
      },
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return value + "%";
        },
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
  };
</script>

<Heading tag="h2" class="px-8 pt-4 text-gray-900 dark:text-white">Podsumowanie</Heading>
<div class="flex flex-row justify-between">
  <ScreenCard class="max-h-128 overflow-y-auto relative px-8 pb-8 flex-[2]">
    <div class="flex justify-between">
      <div class="flex flex-row">
        <h5 class="leading-none text-3xl font-bold">Przybyło:</h5>
        <h5 class="leading-none text-3xl font-bold text-green-500 pb-2 pl-2">+120</h5>
        <h5 class="leading-none text-3xl font-bold pl-4">Ubyło:</h5>
        <h5 class="leading-none text-3xl font-bold text-red-500 pb-2 pl-2">-53</h5>
      </div>
      <div
        class="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 dark:text-green-500 text-center"
      >
        +12%
        <ChevronRightSolid class="w-3 h-3 ml-1" />
      </div>
    </div>
    <Chart {options} />
    <div
      class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between"
    >
      <div class="flex justify-between items-center pt-5">
        <Button
          class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-transparent dark:focus:ring-transparent py-0"
          >Ostatnie 7 dni<ChevronDownSolid class="w-2.5 m-2.5 ml-1.5" /></Button
        >
        <Dropdown class="w-40" offset={-6}>
          <DropdownItem>Yesterday</DropdownItem>
          <DropdownItem>Today</DropdownItem>
          <DropdownItem>Ostatnie 7 dni</DropdownItem>
          <DropdownItem>Last 30 days</DropdownItem>
          <DropdownItem>Last 90 days</DropdownItem>
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
  <ScreenCard class="max-h-128 overflow-y-auto relative mr-8 px-8 pb-8 flex-1">
    <div class="flex justify-between items-start w-full">
      <div class="flex-col items-center">
        <div class="flex items-center mb-1">
          <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white mr-1">
            Produkty 
          </h5>
          <InfoCircleSolid
            id="pie1"
            class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ml-1"
          />
          <Popover
            triggeredBy="#pie1"
            class="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 z-10"
          >
            <div class="p-3 space-y-2">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                Activity growth - Incremental
              </h3>
              <p>
                Report helps navigate cumulative growth of community activities. Ideally, the chart
                should have a growing trend, as stagnating chart signifies a significant decrease of
                community activity.
              </p>
              <h3 class="font-semibold text-gray-900 dark:text-white">Calculation</h3>
              <p>
                For each date bucket, the all-time volume of activities is calculated. This means
                that activities in period n contain all activities up to period n, plus the
                activities generated by your community in period.
              </p>
              <A href="/">Read more <ChevronRightSolid class="w-2 h-2 ml-1.5" /></A>
            </div>
          </Popover>
        </div>
      </div>
      <div class="flex justify-end items-center">
        <DotsHorizontalOutline id="dots-menu" class="dots-menu dark:text-white" />
        <Dropdown triggeredBy="#dots-menu" class="w-44" offset={-6}>
          <DropdownItem><PenSolid class="inline w-3 h-3 mr-2" /> Edit widget</DropdownItem>
          <DropdownItem><DownloadSolid class="inline w-3 h-3 mr-2" />Dropdown data</DropdownItem>
          <DropdownItem
            ><ShareNodesSolid class="inline w-3 h-3 mr-2" />Add to repository</DropdownItem
          >
          <DropdownItem><TrashBinSolid class="inline w-3 h-3 mr-2" />Delete widget</DropdownItem>
        </Dropdown>
      </div>
    </div>

    <Chart options={options2} class="py-6" />

    <div
      class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between"
    >
      <div class="flex justify-between items-center pt-5">
        <Button
          class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-transparent dark:focus:ring-transparent py-0"
          >Ostatnie 7 dni<ChevronDownSolid class="w-2.5 m-2.5 ml-1.5" /></Button
        >
        <Dropdown class="w-40" offset={-6}>
          <DropdownItem>Yesterday</DropdownItem>
          <DropdownItem>Today</DropdownItem>
          <DropdownItem>Ostatnie 7 dni</DropdownItem>
          <DropdownItem>Last 30 days</DropdownItem>
          <DropdownItem>Last 90 days</DropdownItem>
        </Dropdown>
        <A
          href="/"
          class="uppercase text-sm font-semibold hover:text-primary-700 dark:hover:text-primary-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2 hover:no-underline"
        >
          Analiza
          <ChevronRightSolid class="w-2.5 h-2.5 ml-1.5" />
        </A>
      </div>
    </div>
  </ScreenCard>
</div>

<ScreenCard header=" " class="max-h-128 overflow-y-auto relative px-8 pb-8 pt-0">
  <div class="flex justify-between pt-8">
    <PaginationItem class="mb-4" on:click={handlePrev}>
      <ArrowLeftSolid class="w-5 h-5" />
      <Heading tag="h6" class="ml-4">Poprzedni</Heading>
    </PaginationItem>
    <PaginationItem class="mb-4" on:click={handleNext}>
      <Heading tag="h6" class="mr-4">Następny</Heading>
      <ArrowRightSolid class="w-5 h-5" />
    </PaginationItem>
  </div>
  {#if records}
    <Table divClass="relative" class="border-separate">
      <TableHead theadClass="sticky top-0">
        <TableHeadCell class="" />
        {#each records as record}
          <TableHeadCell class="border-l place-items-center"
            >{parseISODatestring(record.date)}</TableHeadCell
          >
        {/each}
      </TableHead>
      {#if records[0]}
        <TableBody>
          {#each records[0].record_view as product, i}
            <TableBodyRow>
              <TableBodyCell>MDX-2{i}-C-{Math.ceil(Math.random() * 100)}</TableBodyCell>
              {#each records as record}
                <TableBodyCell
                  >{Math.round(record.record_view[i].quantity) +
                    Math.ceil(Math.random() * 80)}</TableBodyCell
                >
              {/each}
            </TableBodyRow>
          {/each}
          {#each records[0].record_view as product, i}
            <TableBodyRow>
              <TableBodyCell>MDX-2{i}-C-{Math.ceil(Math.random() * 100)}</TableBodyCell>
              {#each records as record}
                <TableBodyCell
                  >{Math.round(record.record_view[i].quantity) +
                    Math.ceil(Math.random() * 10)}</TableBodyCell
                >
              {/each}
            </TableBodyRow>
          {/each}
        </TableBody>
      {/if}
    </Table>
  {/if}
</ScreenCard>
