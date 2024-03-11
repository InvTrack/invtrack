<script lang="ts">
  import { createTemporaryClient } from "$lib/supabase";
  import { Button, Label, Input, Span } from "flowbite-svelte";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { goto } from "$app/navigation";
  import { currentCompanyId } from "$lib/store";

  let email = "";
  let full_name = "";
  let password = "";
  let loading = false;
  let company_id: number | null = null;

  currentCompanyId.subscribe((id) => id && (company_id = id));

  const update = async () => {
    try {
      loading = true;
      const tempClient = createTemporaryClient();
      const { data, error } = await tempClient.auth.signUp({
        email,
        password,
        options: { data: { company_id, full_name } },
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
      <Span>Imię</Span>
      <Input type="text" name="full_name" required bind:value={full_name} />
    </Label>
    <Label class="space-y-2">
      <Span>E-mail</Span>
      <Input type="email" name="email" required bind:value={email} />
    </Label>
    <Label class="space-y-2">
      <Span>Hasło</Span>
      <Input type="password" name="password" required bind:value={password} />
    </Label>
    <Button type="submit" class="mt-4" color="primary">Dodaj pracownika</Button>
  </form>
</ScreenCard>
