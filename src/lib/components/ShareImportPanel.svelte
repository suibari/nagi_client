<script lang="ts">
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { discardShare, loadShare, withShareLock } from '$lib/share-target/store';
	import type { ShareComposer } from '$lib/share-target/composer';
	import Button from './Button.svelte';

	let { composer }: { composer: ShareComposer } = $props();
	let working = $state(false);
	let errors = $state<string[]>([]);
	const content = $derived(composerHost.shared);
	const composerState = $derived(composer.getShareState());
	const blocked = $derived(
		composerState.hasTarget || Boolean(content?.files.length && composerState.scope === 'kossori'),
	);

	async function act(discard = false) {
		const selected = content;
		const did = $session?.did;
		if (!selected || !did || working) return;
		working = true;
		errors = [];
		try {
			const result = await withShareLock(selected.id, async () => {
				const latest = await loadShare(selected.id);
				if ($session?.did !== did) {
					errors = [m.shareAccountChanged()];
					return;
				}
				if (discard) await discardShare(selected.id);
				else if (latest) errors = await composer.importShared(latest, did);
				else errors = [m.shareMissing()];
				const remaining = await loadShare(selected.id);
				if (composerHost.shared?.id === selected.id) composerHost.shared = remaining;
			});
			if (!result.acquired) errors = [m.shareOtherTab()];
		} catch {
			errors = [m.shareStorageFailed()];
		} finally {
			working = false;
		}
	}
</script>

{#if content}
	<section class="share-import" aria-label={m.shareTitle()}>
		<h2>{m.shareTitle()}</h2>
		<p>{m.sharePostingAs({ did: $session?.did ?? '' })}</p>
		{#if composerState.hasContent}<p>{m.shareAppendConfirm()}</p>{/if}
		{#if composerState.hasTarget}<p role="status">{m.shareRemoveTarget()}</p>{/if}
		{#if content.files.length && composerState.scope === 'kossori'}<p role="status">
				{m.shareChangeScope()}
			</p>{/if}
		<p>{m.shareFileCount({ count: content.files.length })}</p>
		<div class="share-actions">
			<Button
				variant="primary"
				type="button"
				disabled={working || composerState.busy || !composerState.ready || blocked}
				onclick={() => act()}>{working ? m.loading() : m.shareImport()}</Button
			>
			<Button
				type="button"
				variant="secondary"
				disabled={working}
				onclick={() => {
					composerHost.shared = undefined;
				}}>{m.shareLater()}</Button
			>
			<Button type="button" variant="secondary" disabled={working} onclick={() => act(true)}
				>{m.shareDiscard()}</Button
			>
		</div>
		{#each errors as error}<p class="error" role="alert">{error}</p>{/each}
	</section>
{/if}

<style>
	.share-import {
		padding: 12px;
		border: 1px solid var(--line);
		border-radius: 12px;
		margin-bottom: 12px;
		overflow-wrap: anywhere;
	}
	h2 {
		font-size: 1rem;
		margin: 0 0 8px;
	}
	p {
		margin: 8px 0;
	}
	.share-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
</style>
