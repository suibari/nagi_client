<script lang="ts">
	import { APPVIEW_URL } from '$lib/api/appview';
	import type { ChannelView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	import SuggestionList from './SuggestionList.svelte';

	let {
		channels,
		activeIndex,
		onchoose,
		pending = false,
	}: {
		channels: ChannelView[];
		activeIndex: number;
		onchoose: (channel: ChannelView) => void;
		pending?: boolean;
	} = $props();

	const resolve = (url?: string) => (url?.startsWith('/') ? APPVIEW_URL + url : url);
</script>

<SuggestionList
	items={channels}
	{activeIndex}
	{onchoose}
	{pending}
	keyOf={(channel) => channel.uri}
	listClass="channel-suggestions"
	ariaLabel={m.channelSuggestions()}
>
	{#snippet row(channel)}
		<span class="channel-suggestion-header">
			{#if channel.banner}
				<!--
					バナーは PDS 原本をそのまま 76×44 に縮めて表示するので、候補APIの往復より
					優先されないよう後回しにする。行のテキストは画像を待たずに出る。
				-->
				<img
					src={resolve(channel.banner)}
					alt=""
					loading="lazy"
					decoding="async"
					fetchpriority="low"
				/>
			{:else}
				<Icon name="hash" size={18} />
			{/if}
		</span>
		<span class="channel-suggestion-copy">
			<strong>#{channel.name}</strong>
			{#if channel.description}<small>{channel.description}</small>{/if}
		</span>
	{/snippet}
</SuggestionList>
