<script lang="ts">
  import { Indicator, Listgroup, ListgroupItem, Modal } from "flowbite-svelte";
  import { BellActiveAltSolid } from "flowbite-svelte-icons";
  import type { Notification } from "./notificationCenter.types";

  export let open = false;
  export let notifications: Notification[] | null = [];
</script>

{#if notifications}
  <Modal bind:open class="max-h-128" size="md" outsideclose>
    <svelte:fragment slot="header">
      <div class="ml-2 flex flex-row gap-2">
        <BellActiveAltSolid class="h-6 w-6 self-center text-gray-500 dark:text-gray-400" />
        <h2 class="text-2xl font-normal text-gray-500 dark:text-gray-400">Powiadomienia</h2>
      </div>
    </svelte:fragment>
    <div class="flex flex-col items-start justify-start text-center">
      <Listgroup class="w-full">
        {#each notifications as notification (notification.data)}
          <ListgroupItem class="flex flex-row gap-2" active>
            <Indicator class="self-center bg-orange-400" />
            <div class="flex flex-col text-left">
              <h3 class="text-base font-normal text-gray-900 dark:text-white">
                {notification.name}
              </h3>
              <div class="flex flex-row gap-2">
                {#if notification.type === "low_quantity"}
                  {@const notificationThresholdUnit =
                    notification.data.notificationThreshold + " " + notification.data.unit}
                  {@const quantityUnit = notification.data.quantity + " " + notification.data.unit}
                  <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Niski stan produktu {notification.name} - minimalna porządana ilość: {notificationThresholdUnit},
                    obecnie jest: {quantityUnit}
                  </p>
                {/if}
              </div>
            </div>
          </ListgroupItem>
        {/each}
      </Listgroup>
    </div>
  </Modal>
{/if}
