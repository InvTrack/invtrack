<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { Card, Button, Label, Input, Checkbox, Span, Heading } from "flowbite-svelte";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { goto } from "$app/navigation";

  let email = "";
  let loading = false;
  const update = async () => {
    try {
      loading = true;
      let { error } = await supabase.rpc("assign_new_worker_to_company", {
        new_company_id: 1,
        worker_email: email,
      });
      if (error) throw error;
      goto("/workers");
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      loading = false;
    }
  };
</script>

<ScreenCard header="Add worker">
  <form on:submit|preventDefault={update}>
    <Label class="space-y-2">
      <Span>Email</Span>
      <Input type="email" name="email" required bind:value={email} />
    </Label>
    <Button type="submit" class="mt-4" color="primary">Add worker</Button>
  </form>
</ScreenCard>
