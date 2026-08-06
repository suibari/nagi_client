<script lang="ts">
	// フィードの唯一の画面。どのタブを出すかは `?tab=<id>` だけで決まる。
	// タブ構成はユーザー設定（$lib/feed-tabs）で、/settings/feed-tabs から編集する。
	// `/global` と `/affirmation` は昔の URL の互換として残してあり、中身はここと同じ。
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import FeedShell from '$lib/components/FeedShell.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { pageRefresh } from '$lib/components/shell/nav';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import { channelHref, feedTabLabel, resolveFeedTab } from '$lib/feed-tabs/resolve';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let homeAuthError = $state(false);
	let shell = $state<ReturnType<typeof FeedShell>>();

	const tab = $derived(feedTabs.byId(page.url.searchParams.get('tab')) ?? feedTabs.fallback);
	const spec = $derived(
		resolveFeedTab(tab, {
			did: $session?.did,
			onAuthError: (failed) => (homeAuthError = failed),
		}),
	);

	// アカウントが変わったらキャッシュを捨てる。spec.key に DID が入っているだけでは、
	// 前のアカウントぶんのフィードがキャッシュに残り続ける。
	let lastDid: string | undefined;
	let started = false;
	$effect(() => {
		if (!$oauthReady) return;
		const did = $session?.did;
		if (started && did === lastDid) return;
		const first = !started;
		started = true;
		lastDid = did;
		if (!first) shell?.reset();
	});

	// ナビの「フィード」をもう一度押したときの取り直し。
	let seenRefresh = 0;
	onMount(() =>
		pageRefresh.subscribe((count) => {
			if (count === seenRefresh) return;
			seenRefresh = count;
			void shell?.refresh();
		}),
	);
</script>

{#if !$oauthReady}
	<div class="timeline-loading" role="status" aria-label={m.loading()}>
		<span class="spinner" aria-hidden="true"></span>
	</div>
{:else}
	<FeedTabs activeId={tab.id} />
	{#if spec.channelUri}
		<!-- チャンネルタブは閲覧専用。バナーや追加ボタンはチャンネルページ側に置く。 -->
		<a class="feed-tab-channel-link" href={channelHref(spec.channelUri)}>
			<Icon name="hash" size={14} />{m.feedTabsOpenChannel({ name: feedTabLabel(tab) })}
		</a>
	{/if}
	<FeedShell bind:this={shell} {spec} {homeAuthError} />
{/if}
