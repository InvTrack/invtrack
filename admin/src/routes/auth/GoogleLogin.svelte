<script lang="ts">
  import { Button } from "flowbite-svelte";
  import { GoogleSolid } from "flowbite-svelte-icons";

  // TODO SUPABASE
  export let supabase: any;

  let loading = false;

  const handleGoogleLogin = async () => {
    try {
      loading = true;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      console.log(data, error);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      loading = false;
    }
  };
</script>

<Button class="flex justify-center" on:click={handleGoogleLogin}>
  <GoogleSolid class="mr-2" />
  Zaloguj się z Google
</Button>
