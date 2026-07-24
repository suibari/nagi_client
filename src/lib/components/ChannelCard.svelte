<script lang="ts">
	import type { ChannelView } from '$lib/api/types';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { m, relativeTime } from '$lib/i18n/i18n.svelte';

	let { channel }: { channel: ChannelView } = $props();

	const resolve = (url?: string) => (url?.startsWith('/') ? APPVIEW_URL + url : url);
	// at://<did>/<collection>/<rkey> → /channels/<did>/<rkey>
	const channelHref = (uri: string) => {
		const rest = uri.slice('at://'.length).split('/');
		return `/channels/${rest[0]}/${rest[2]}`;
	};
	// 更新日時は「最新投稿時刻（なければ作成日時）」の相対表示。
	const updatedAt = (c: ChannelView) => relativeTime(c.lastPostAt ?? c.createdAt);
</script>

<a class="channel-card" href={channelHref(channel.uri)}>
	<span class="channel-card-media">
		{#if channel.banner}
			<img src={resolve(channel.banner)} alt="" loading="lazy" />
		{/if}
	</span>
	<span class="channel-card-name">{channel.name}</span>
	<span class="channel-card-foot">
		{#if channel.description}<span class="channel-card-desc">{channel.description}</span>{/if}
		<span class="channel-card-updated">{m.channelUpdatedAt({ time: updatedAt(channel) })}</span>
	</span>
</a>
