<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	// 昔からの全肯定フィードの URL。全肯定はおすすめに置き換えたので、ブックマークや
	// 外部リンクのためにおすすめタブを開く（FEED-01）。
	import FeedShell from '$lib/components/FeedShell.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import { resolveFeedTab } from '$lib/feed-tabs/resolve';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	const spec = $derived(
		resolveFeedTab(
			{ id: 'recommended', kind: 'custom', source: 'recommended' },
			{ did: $session?.did },
		),
	);
</script>

{#if !$oauthReady}
	<Spinner />
{:else}
	<FeedTabs activeId={feedTabs.byId('recommended')?.id ?? 'recommended'} />
	<FeedShell {spec} />
{/if}
