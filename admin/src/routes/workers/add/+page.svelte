<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { Card, Button, Label, Input, Checkbox, Span, Heading } from "flowbite-svelte";
  import ScreenCard from "$lib/ScreenCard.svelte";
  let email = "";
</script>

<ScreenCard header="Add worker">
  <Label class="space-y-2">
    <Span>Email</Span>
    <Input type="email" name="email" required bind:value={email} />
  </Label>
</ScreenCard>
