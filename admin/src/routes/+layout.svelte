<script lang="ts">
	import Navbar from './Navbar.svelte';
	import './styles.css';

	import { onMount } from 'svelte';
	import { supabase } from '../lib/supabase';
	import type { AuthSession } from '@supabase/supabase-js';
	import { page } from '$app/stores';
	import { googleAccessToken } from '../lib/store';
	// import Account from './lib/Account.svelte'
	// import Auth from './lib/Auth.svelte'

	let session: AuthSession;

	onMount(() => {
		// console.log($page)
		const urlStringOriginal = $page.url.href;
		if (urlStringOriginal?.includes('#access_token')) {
			const urlString = urlStringOriginal.replace('#access_token', '?access_token');
			const url = new URL(urlString);
			const refreshToken = url.searchParams.get('refresh_token');
			const accessToken = url.searchParams.get('access_token');
			const providerToken = url.searchParams.get('provider_token');
			console.log({
				urlStringOriginal,
				providerToken,
				accessToken,
				refreshToken
			});
			if (accessToken && refreshToken) {
				supabase.auth
					.setSession({
						refresh_token: refreshToken,
						access_token: accessToken
					})
					.then((res) => {
						// console.log({ res });
						// setSession(session);
						res.data.session;
					})
					.catch((err) => console.log({ err }));
			}
			if (providerToken) {
				console.log({ providerToken });
				googleAccessToken.set(providerToken);
			}
		}

		supabase.auth.getSession().then(({ data }) => {
			console.log(data);
			if (data.session) session = data.session;
		});

		supabase.auth.onAuthStateChange((_event, _session) => {
			if (_session) session = _session;
		});
	});
</script>

<div class="app">
	<Navbar />

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		/* width: 100%; */
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
