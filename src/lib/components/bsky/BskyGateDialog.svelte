<script lang="ts">
	import { onMount } from 'svelte';
	import { applyBskyGates, getBskyGates } from '$lib/bsky/agent';
	import { DEFAULT_BSKY_GATES, type BskyGateSettings } from '$lib/bsky/gates';
	import type { BskyPostCardView } from '$lib/bsky/mapView';
	import { portal } from '$lib/actions/portal';
	import { m } from '$lib/i18n/i18n.svelte';
	import Button from '../Button.svelte';
	import Spinner from '../Spinner.svelte';
	import BskyGateControls from './BskyGateControls.svelte';

	/**
	 * Nagi 経由で作った自分の Bluesky 投稿の、返信できる人と引用の可否を後から変える（BSKY-12）。
	 * update の権限は持たないので、付いている設定を消して付け直す。
	 */
	let { post, onclose }: { post: BskyPostCardView; onclose: () => void } = $props();

	/** 返信の制限はスレッドの先頭にだけ効く。 */
	const isRoot = $derived(!(post.raw.record as { reply?: unknown }).reply);
	let settings = $state<BskyGateSettings>({ ...DEFAULT_BSKY_GATES });
	let initial = $state<BskyGateSettings>();
	/** 公式アプリで組んだ、Nagi で選べない返信の条件が付いている。 */
	let customReply = $state(false);
	let replyTouched = $state(false);
	let loading = $state(true);
	let busy = $state(false);
	let error = $state('');

	onMount(() => {
		getBskyGates(post.uri)
			.then((current) => {
				customReply = current.reply === undefined;
				settings = { reply: current.reply ?? 'everyone', allowQuote: current.allowQuote };
				initial = { ...settings };
			})
			.catch((cause) => {
				console.warn('[BskyGateDialog] load failed', cause);
				error = m.bskyGatesLoadFailed();
			})
			.finally(() => (loading = false));
	});

	async function save() {
		if (busy || !initial) return;
		busy = true;
		error = '';
		// 公式アプリの条件は、選び直さない限り残す。
		const replyChanged = customReply ? replyTouched : settings.reply !== initial.reply;
		try {
			await applyBskyGates(
				{
					replyRoot: isRoot && replyChanged ? post.uri : undefined,
					posts: settings.allowQuote !== initial.allowQuote ? [post.uri] : [],
				},
				settings,
				{ replace: true },
			);
			onclose();
		} catch (cause) {
			console.warn('[BskyGateDialog] save failed', cause);
			error = m.bskyGatesSaveFailed();
		} finally {
			busy = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !busy) onclose();
	}
</script>

<svelte:window onkeydown={keydown} />
<div
	class="delete-backdrop"
	role="presentation"
	use:portal
	onclick={(event) => event.target === event.currentTarget && !busy && onclose()}
>
	<div class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="bsky-gates-title">
		<h2 id="bsky-gates-title">{m.bskyGatesTitle()}</h2>
		{#if loading}
			<Spinner size="sm" />
		{:else if initial}
			<BskyGateControls
				bind:settings
				replyApplicable={isRoot}
				customReply={customReply && !replyTouched}
				onreplychange={() => (replyTouched = true)}
				disabled={busy}
			/>
		{/if}
		{#if error}<p class="delete-error" role="alert">{error}</p>{/if}
		<div class="delete-actions">
			<Button variant="secondary" type="button" disabled={busy} onclick={onclose}
				>{m.cancel()}</Button
			>
			<Button variant="primary" type="button" disabled={busy || !initial} onclick={save}
				>{m.bskyGatesSave()}</Button
			>
		</div>
	</div>
</div>
