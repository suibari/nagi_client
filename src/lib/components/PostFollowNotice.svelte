<script lang="ts">
	import { postFollowNotice } from '$lib/feed/post-follow.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { page } from '$app/state';
	import Icon from './shell/Icon.svelte';

	let lastUrl = $state('');
	$effect(() => {
		const currentUrl = page.url.href;
		if (lastUrl && currentUrl !== lastUrl) postFollowNotice.clear();
		lastUrl = currentUrl;
	});
</script>

{#if postFollowNotice.current}
	<aside class="post-follow-notice" role="status" aria-live="polite">
		<span>{m.postCreated()}</span>
		<a href={postFollowNotice.current.href} onclick={() => postFollowNotice.clear()}
			>{m.viewCreatedPost()}</a
		>
		<button
			type="button"
			aria-label={m.dismissNotice()}
			title={m.dismissNotice()}
			onclick={() => postFollowNotice.clear()}><Icon name="cancel" size={17} /></button
		>
	</aside>
{/if}

<style>
	.post-follow-notice {
		position: fixed;
		z-index: 40;
		left: 50%;
		bottom: 24px;
		transform: translateX(-50%);
		box-sizing: border-box;
		width: min(420px, calc(100% - 24px));
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 11px 12px 11px 16px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-card);
		color: var(--text);
		font-size: 13px;
	}
	.post-follow-notice a {
		margin-left: auto;
		color: var(--accent-strong);
		font-weight: 800;
		white-space: nowrap;
	}
	.post-follow-notice button {
		display: inline-grid;
		place-items: center;
		flex: none;
		width: 32px;
		height: 32px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--text-muted);
	}
	.post-follow-notice button:hover {
		background: var(--accent-softer);
		color: var(--accent-strong);
	}
	@media (max-width: 767px) {
		.post-follow-notice {
			bottom: calc(82px + env(safe-area-inset-bottom));
		}
	}
</style>
