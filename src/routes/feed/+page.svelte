<script lang="ts">
	// 従来の `/`（ホームタイムライン）。`/` は my Nagi になったのでここへ移した。
	// グローバル・全肯定は今までどおり /global と /affirmation に居る。
	import MainFeed from '$lib/components/MainFeed.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
</script>

{#if !$oauthReady}
	<div class="timeline-loading" role="status" aria-label={m.loading()}>
		<span class="spinner" aria-hidden="true"></span>
	</div>
{:else}
	{#key $session?.did ?? 'guest'}
		<MainFeed mode={$session ? 'home' : 'global'} />
	{/key}
{/if}
