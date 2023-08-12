<script lang="ts">
    import { onMount } from "svelte";
    import type { AuthSession } from "@supabase/supabase-js";
    import { supabase } from "../../lib/supabase";
	import type { Tables } from "$lib/helpers";
  
    export let session: AuthSession;
  
    let loading = false
    let workers: Tables<"worker">[] | null = null
    // let website: string | null = null
    // let avatarUrl: string | null = null
  
    onMount(() => {
      getProfile()
    })
  
    const getProfile = async () => {
      try {
        loading = true
        const { user } = session
  
        const { data, error, status } = await supabase
          .from("worker")
          .select()
        //   .eq('id', user.id)
        //   .single()
  
        if (error && status !== 406) throw error
  
        if (data) {
            workers = data
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        loading = false
      }
    }
  
</script>
  
{#if workers}
    {#each workers as worker}
        <li>
            {worker.name}
        </li>
    {/each}
{/if} 