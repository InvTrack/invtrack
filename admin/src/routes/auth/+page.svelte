<script lang="ts">
    import { supabase } from '../../supabase'
  
    let loading = false
    let email = ''
    let password = ''
  
    const handleLogin = async () => {
      try {
        loading = true
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        console.log(data, error)
        if (error) throw error
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        loading = false
      }
    }
    const googleLogin = async () => {
      try {
        loading = true
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google"
        })
        console.log(data, error)
        if (error) throw error
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        loading = false
      }
	  }
  </script>
  
  <div class="row flex-center flex">
    <div class="col-6 form-widget" aria-live="polite">
      <form class="form-widget" on:submit|preventDefault="{handleLogin}">
        <div>
          <label for="email">Email</label>
          <input
            id="email"
            class="inputField"
            type="email"
            placeholder="Your email"
            bind:value="{email}"
          />
        </div>
        <div>
          <label for="email">Password</label>
          <input
            id="password"
            class="inputField"
            type="password"
            placeholder="Your password"
            bind:value="{password}"
          />
        </div>
        <div>
          <button type="submit" class="button block" aria-live="polite" disabled="{loading}">
            <span>{loading ? 'Loading' : 'Login'}</span>
          </button>
          <button on:click={googleLogin}>Login with Google</button>
        </div>
      </form>
    </div>
  </div>