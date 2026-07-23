<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		channel,
		kossori = false,
	}: {
		channel?: PostView['channel'];
		kossori?: boolean;
	} = $props();

	const channelHref = (uri: string) => {
		const rest = uri.slice('at://'.length).split('/');
		return `/channels/${rest[0]}/${rest[2]}`;
	};
</script>

{#if channel || kossori}
	<header class="thread-flags">
		{#if channel}
			<a
				class="channel-badge"
				href={channelHref(channel.uri)}
				aria-label={m.channelBadgeAria({ name: channel.name ?? '' })}
				><Icon name="hash" size={12} />{channel.name ?? m.navChannels()}</a
			>
		{/if}
		{#if kossori}
			<span class="kossori-badge" title={m.kossoriBadgeAria()} aria-label={m.kossoriBadgeAria()}
				><Icon name="hide" size={12} />{m.kossoriBadge()}</span
			>
		{/if}
	</header>
{/if}
