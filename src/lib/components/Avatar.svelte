<script lang="ts">
	import { APPVIEW_URL } from '$lib/api/appview';
	let {
		actor,
		size,
	}: {
		actor?: { displayName?: string; handle?: string; avatar?: string };
		size?: 'small' | 'large';
	} = $props();
	let src = $derived(
		actor?.avatar
			? actor.avatar.startsWith('/')
				? APPVIEW_URL + actor.avatar
				: actor.avatar
			: undefined,
	);
	let initial = $derived(
		actor?.displayName?.slice(0, 1) ?? actor?.handle?.slice(0, 1)?.toUpperCase() ?? '○',
	);
</script>

<span class="avatar" class:small={size === 'small'} class:large={size === 'large'}>
	{#if src}<img {src} alt="" loading="lazy" />{:else}{initial}{/if}
</span>
