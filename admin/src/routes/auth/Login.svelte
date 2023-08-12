<script lang="ts">
  import { supabase } from "../../lib/supabase";

  let loading = false;
  let email = "";
  let password = "";

  const handleLogin = async () => {
    try {
      loading = true;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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

<div class="grid h-screen place-items-center">
  <div
    class="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm p-4 sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700"
  >
    <form class="space-y-6" on:submit|preventDefault={handleLogin}>
      <h3 class="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>
      <div>
        <label for="email" class="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300"
          >Email:</label
        >
        <input
          id="email"
          type="email"
          name="email"
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          placeholder="Your email"
          bind:value={email}
          required={true}
        />
      </div>
      <div>
        <label
          for="password"
          class="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300">Password:</label
        >
        <input
          type="password"
          name="password"
          id="password"
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          placeholder="••••••••"
          bind:value={password}
          required={true}
        />
      </div>
      <!-- <div class="flex items-start">
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="remember"
              aria-describedby="remember"
              type="checkbox"
              class="bg-gray-50 border border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
            />
          </div>
          <div class="text-sm ml-3">
            <label for="remember" class="font-medium text-gray-900 dark:text-gray-300"
              >Remember me</label
            >
          </div>
        </div>
        <a href="#" class="text-sm text-blue-700 hover:underline ml-auto dark:text-blue-500"
          >Lost Password?</a
        >
      </div> -->
      <button
        type="submit"
        class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >Login</button
      >
      <button
        type="button"
        on:click={handleGoogleLogin}
        class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        <svg
          class="mr-2 -ml-1 w-5 h-5 absolute"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>
      <!-- <button
        class="w-full flex justify-center border font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:border-slate-400 hover:text-slate-900 hover:bg-grey-100"
      >
        <img
          class="w-4 h-4"
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          loading="lazy"
          alt="google logo"
        />
        <span>Login with Google</span>
      </button> -->
      <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
        Not registered? <a href="#" class="text-blue-700 hover:underline dark:text-blue-500"
          >Create account</a
        >
      </div>
    </form>
  </div>
</div>

<!-- <div
  class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
>
  <div class="col-6 form-widget" aria-live="polite">
    <form class="form-widget" on:submit|preventDefault={handleLogin}>
      <div>
        <label for="email">Email</label>
        <input
          id="email"
          class="inputField"
          type="email"
          placeholder="Your email"
          bind:value={email}
        />
      </div>
      <div>
        <label for="email">Password</label>
        <input
          id="password"
          class="inputField"
          type="password"
          placeholder="Your password"
          bind:value={password}
        />
      </div>
      <div>
        <button type="submit" class="button block" aria-live="polite" disabled={loading}>
          <span>{loading ? "Loading" : "Login"}</span>
        </button>
        <button on:click={googleLogin}>Login with Google</button>
      </div>
    </form>
  </div>
</div> -->
