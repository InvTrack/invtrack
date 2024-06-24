<script lang="ts">
  import Tooltip from "$lib/Tooltip.svelte";
  import { genericUpdate } from "$lib/genericUpdate";
  import type { PatchedDatabase } from "$lib/helpers";
  import ErrorModal from "$lib/modals/ErrorModal.svelte";
  import type { SupabaseClient } from "@supabase/supabase-js";

  import { Button, Input, Span } from "flowbite-svelte";
  import { CloseCircleSolid } from "flowbite-svelte-icons";

  export let unsavedChanges: boolean;
  export let aliases: string[];
  let newAliases: string[] = [];
  let deleteAliases: string[] = [];
  export let newAlias: string | null = null;

  let aliasErrorModal = false;

  const addAlias = () => {
    if (!newAlias) return;
    if (aliases.find((v) => v === newAlias) || newAliases.find((v) => v === newAlias)) {
      aliasErrorModal = true;
      return;
    }
    aliases = [...aliases, newAlias];
    newAliases = [...newAliases, newAlias];
    newAlias = null;
    unsavedChanges = true;
  };

  const deleteAlias = (aliasIndex: number) => {
    unsavedChanges = true;
    deleteAliases = [...deleteAliases, aliases[aliasIndex]];
    aliases = aliases.filter((_, i) => i !== aliasIndex);
  };

  export const submit = (
    supabase: SupabaseClient<PatchedDatabase>,
    setLoading: (x: boolean) => void,
    company_id: number,
    recipe_id: number
  ) => {
    if (newAliases) {
      newAliases.forEach((newAlias) => {
        genericUpdate(
          supabase.from("name_alias").insert({ alias: newAlias, company_id, recipe_id: recipe_id }),
          {
            setLoading,
            onError: () => {
              aliasErrorModal = true;
            },
          }
        );
      });
      // TODO - handle error when request fails
      newAliases = [];
    }
    if (deleteAliases) {
      deleteAliases.forEach((aliasToDelete) => {
        genericUpdate(
          supabase.from("name_alias").delete().match({ company_id, alias: aliasToDelete }),
          {
            setLoading,
            onError: () => {
              aliasErrorModal = true;
            },
          }
        );
      });
      // TODO - handle error when request fails
      deleteAliases = [];
    }
  };
</script>

<div class="mt-2 space-y-2">
  <ErrorModal
    open={aliasErrorModal}
    message="Nie udało się dodać/usunąć aliasu - spróbuj za chwilę"
    confirmText="OK"
    onConfirm={() => {
      aliasErrorModal = false;
    }}
  />
  <div class="mt-2 space-y-2">
    <Span class="flex flex-row"
      >Aliasy nazw <Tooltip id="alias-ttip">
        <div class="space-y-2 p-3">
          <h3 class="font-semibold text-gray-900 dark:text-white">Aliasy nazw - co to?</h3>
          Nazwy receptur mogą się różnić między systemem InvTrack, a np. twoim systemem POS. Aby umożliwić
          łatwe rozpoznawanie produktów na raportach podczas skanowania, umożliwiamy dodawanie różnych
          nazw tej samej receptury - aliasów.
          <br />
          <strong class="text-gray-900 dark:text-white">
            Mimo tego, że można robić to tutaj, zalecamy wprowadzać kody w aplikacji.
          </strong>
        </div>
      </Tooltip></Span
    >
    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-2 place-items-start gap-4">
        <div class="col-span-2 flex w-full gap-4">
          <Input
            type="text"
            name="steps"
            placeholder="Dodaj kod"
            class="h-min w-full"
            bind:value={newAlias}
          />
          <Button color="primary" class="shrink-0" on:click={addAlias}>Dodaj alias</Button>
        </div>
        {#each aliases as _alias, i}
          <Input
            type="text"
            name="steps"
            readonly
            class="h-fit focus:border-gray-300 focus:ring-0 focus:dark:border-gray-600"
            required
            bind:value={aliases[i]}
          >
            <CloseCircleSolid slot="right" on:click={() => deleteAlias(i)} />
          </Input>
        {/each}
      </div>
    </div>
  </div>
</div>
