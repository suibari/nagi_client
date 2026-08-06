<script lang="ts">
	// 昔からの公開グローバルTLの URL。クローラ向けにプリレンダを維持したいので
	// `/feed?tab=global` へ寄せず独立したルートのまま、中身だけ FeedShell に揃える。
	import FeedShell from '$lib/components/FeedShell.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import { resolveFeedTab } from '$lib/feed-tabs/resolve';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	const spec = $derived(resolveFeedTab({ id: 'global', kind: 'global' }, { did: $session?.did }));
</script>

{#if !$oauthReady}
	<div class="timeline-loading" role="status" aria-label={m.loading()}>
		<span class="spinner" aria-hidden="true"></span>
	</div>
{:else}
	<FeedTabs activeId="global" />
	<FeedShell {spec} />
{/if}
