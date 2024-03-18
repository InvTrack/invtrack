<script lang="ts">
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { Chart } from "flowbite-svelte";
  export let data;
  let { chartData, product } = data;
</script>

<ScreenCard header={`${product?.name} - Wykres ceny za ${product?.unit}`}>
  <Chart
    options={{
      chart: {
        height: "400px",
        type: "line",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        cssClass: "text-gray-500",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 6,
        curve: "straight",
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -26,
        },
      },
      series: [
        {
          name: "Cena",
          data: chartData.map((x) => x.price_per_unit),
          color: "#1A56DB",
        },
      ],
      legend: {
        show: false,
      },
      xaxis: {
        categories: chartData.map((x) => x.date.toLocaleDateString()),
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
      },
      yaxis: {
        show: true,
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
        },
      },
    }}
  />
</ScreenCard>
