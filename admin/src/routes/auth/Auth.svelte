<script lang="ts">
  import CenterCard from "./CenterCard.svelte";
  import Login from "./Login.svelte";
  import Register from "./Register.svelte";

  let siteState: "logging" | "registering" = "logging";

  let switchSiteState = () => {
    siteState = siteState === "logging" ? "registering" : "logging";
  };
</script>

<CenterCard>
  {#if siteState === "logging"}
    <Login {switchSiteState} />
  {:else if siteState === "registering"}
    <Register {switchSiteState} />
  {/if}
</CenterCard>
