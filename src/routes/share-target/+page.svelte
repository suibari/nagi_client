<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { session, oauthReady, setOAuthReturnTo } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		discardShare,
		loadShare,
		withShareLock,
		type SharedContent,
	} from '$lib/share-target/store';
	import Button from '$lib/components/Button.svelte';

	let content = $state<SharedContent>();
	let loading = $state(true);
	let error = $state('');
	let finished = $state(false);
	const id = $derived(page.url.searchParams.get('id') ?? '');

	async function refresh(receipt: string) {
		loading = true;
		error = '';
		try {
			const value = receipt ? await loadShare(receipt) : undefined;
			if (receipt !== id) return;
			content = value;
			if (!value && !finished) error = m.shareMissing();
		} catch {
			if (receipt !== id) return;
			content = undefined;
			error = m.shareStorageFailed();
		} finally {
			if (receipt === id) loading = false;
		}
	}
	$effect(() => {
		void refresh(id);
	});
	$effect(() => {
		if (composerHost.open || !id) return;
		void refresh(id);
	});

	function open() {
		if (!content) return;
		if (!$session) {
			setOAuthReturnTo(`/share-target?id=${encodeURIComponent(id)}`);
			void goto('/login');
		} else {
			finished = true;
			composerHost.showShared(content);
		}
	}

	async function discard() {
		try {
			const result = await withShareLock(id, () => discardShare(id));
			if (!result.acquired) {
				error = m.shareOtherTab();
				return;
			}
			content = undefined;
			finished = true;
		} catch {
			error = m.shareStorageFailed();
		}
	}
</script>

<svelte:head
	><title>{m.shareTitle()} — Nagi</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>

<section class="share-page">
	<h1>{m.shareTitle()}</h1>
	{#if loading || !$oauthReady}<p role="status">{m.loading()}</p>
	{:else}
		{#if error}<p class="error" role="alert">{error}</p>{/if}
		{#if content}
			<p>{m.shareReview()}</p>
			{#if content.text}<pre>{content.text}</pre>{/if}
			<p>{m.shareFileCount({ count: content.files.length })}</p>
			<ul>
				{#each content.files as item (item.id)}<li>{item.file.name}</li>{/each}
			</ul>
			{#if $session}<p>{m.sharePostingAs({ did: $session.did })}</p>{:else}<p>
					{m.shareLoginRequired()}
				</p>{/if}
			<div class="share-actions">
				<Button type="button" onclick={open}
					>{$session ? m.shareOpenComposer() : m.shareLogin()}</Button
				>
				<Button type="button" variant="secondary" onclick={discard}>{m.shareDiscard()}</Button>
			</div>
		{:else if finished}<p role="status">{m.shareHandled()}</p>{/if}
		<Button type="button" variant="secondary" onclick={() => refresh(id)}>{m.retry()}</Button>
	{/if}
</section>

<style>
	.share-page {
		padding: 24px 16px;
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font: inherit;
		padding: 12px;
		background: var(--bg-raised);
		border-radius: 12px;
	}
	.share-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-block: 16px;
	}
</style>
