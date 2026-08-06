<script lang="ts">
	// 昔からの全肯定フィードの URL。いまは `/feed?tab=affirmation`（kind: custom）と同じ中身で、
	// ブックマークや外部リンクのために残してある。
	import FeedShell from '$lib/components/FeedShell.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import { resolveFeedTab } from '$lib/feed-tabs/resolve';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	const spec = $derived(
		resolveFeedTab(
			{ id: 'affirmation', kind: 'custom', source: 'affirmation' },
			{ did: $session?.did },
		),
	);
</script>

{#if !$oauthReady}
	<div class="timeline-loading" role="status" aria-label={m.loading()}>
		<span class="spinner" aria-hidden="true"></span>
	</div>
{:else}
	<FeedTabs activeId="affirmation" />
	<FeedShell {spec} />
{/if}
