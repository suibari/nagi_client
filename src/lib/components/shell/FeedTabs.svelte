<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';

	let { active }: { active?: 'home' | 'global' | 'affirmation' } = $props();
	const current = $derived(
		active ??
			(page.url.pathname.startsWith('/affirmation')
				? 'affirmation'
				: page.url.pathname.startsWith('/global')
					? 'global'
					: 'home'),
	);
</script>

<nav class="feed-tabs" aria-label={m.feedTabsAria()}>
	<a href={$session ? '/' : '/login'} class:active={current === 'home'}>{m.navHome()}</a>
	<a href="/global" class:active={current === 'global'}>{m.navGlobal()}</a>
	<a href="/affirmation" class:active={current === 'affirmation'}>{m.navAffirmation()}</a>
</nav>
