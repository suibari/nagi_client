<script lang="ts">
	import { APPVIEW_URL } from '$lib/api/appview';
	import type { ChannelView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		channels,
		activeIndex,
		onchoose,
	}: {
		channels: ChannelView[];
		activeIndex: number;
		onchoose: (channel: ChannelView) => void;
	} = $props();

	const resolve = (url?: string) => (url?.startsWith('/') ? APPVIEW_URL + url : url);
</script>

{#if channels.length}
	<div
		class="mention-suggestions channel-suggestions"
		role="listbox"
		aria-label={m.channelSuggestions()}
	>
		{#each channels as channel, index (channel.uri)}
			<button
				type="button"
				class:active={index === activeIndex}
				role="option"
				aria-selected={index === activeIndex}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => onchoose(channel)}
			>
				<span class="channel-suggestion-header">
					{#if channel.banner}
						<img src={resolve(channel.banner)} alt="" loading="lazy" />
					{:else}
						<Icon name="hash" size={18} />
					{/if}
				</span>
				<span class="channel-suggestion-copy">
					<strong>#{channel.name}</strong>
					{#if channel.description}<small>{channel.description}</small>{/if}
				</span>
			</button>
		{/each}
	</div>
{/if}
