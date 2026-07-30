<script lang="ts">
	import MainFeed from '$lib/components/MainFeed.svelte';
	import { oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
</script>

{#if !$oauthReady}
	<div class="timeline-loading" role="status" aria-label={m.loading()}>
		<span class="spinner" aria-hidden="true"></span>
	</div>
{:else}
	<MainFeed mode="global" />
{/if}
