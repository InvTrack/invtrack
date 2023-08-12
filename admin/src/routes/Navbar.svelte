<script>
	import { page } from '$app/stores';
</script>

<nav
	id="default-sidebar"
	class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
	aria-label="Sidebar"
>
	<div class="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
		<ul class="space-y-2 font-medium">
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a
					href="/"
					class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
				>
					<span class="ml-3">Dashboard</span>
				</a>
			</li>
			<li aria-current={$page.url.pathname === '/workers' ? 'page' : undefined}>
				<a
					href="/workers"
					class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
				>
					<span class="flex-1 ml-3 whitespace-nowrap">Workers</span>
				</a>
			</li>
			<li aria-current={$page.url.pathname === '/auth' ? 'page' : undefined}>
				<a
					href="/auth"
					class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
				>
					<span class="flex-1 ml-3 whitespace-nowrap">Sign In</span>
				</a>
			</li>
		</ul>
	</div>
</nav>
