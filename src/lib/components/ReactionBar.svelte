<script lang="ts">
	import type { ReactionView } from '$lib/api/types';
	import { session } from '$lib/oauth/session.svelte';
	import { createReaction, deleteRecord } from '$lib/atproto/records';
	import EmojiPicker from './EmojiPicker.svelte';
	let {
		uri,
		cid,
		reactions = [],
	}: { uri: string; cid: string; reactions?: ReactionView[] } = $props();
	const REACTION = 'com.suibari.nagi.reaction';
	// The appview only learns about reactions via jetstream (a few seconds behind),
	// so we keep an optimistic local copy and ignore prop-driven resets for a while
	// after a local toggle — otherwise the next feed refresh would undo the click.
	const HOLD_MS = 15_000;
	// svelte-ignore state_referenced_locally -- initial snapshot; kept in sync by the $effect below
	let local = $state<ReactionView[]>([...reactions]);
	let holdUntil = 0;
	let busy = $state(false);
	let pickerOpen = $state(false);
	$effect(() => {
		const incoming = reactions;
		if (Date.now() >= holdUntil) local = [...incoming];
	});
	const rkeyOf = (u?: string) => u?.split('/').pop();
	async function toggle(raw: string) {
		if (!$session) {
			location.href = '/login';
			return;
		}
		if (busy) return;
		pickerOpen = false;
		const emoji = raw.normalize('NFC');
		const existing = local.find((r) => r.emoji === emoji);
		const snapshot = local.map((r) => ({ ...r }));
		busy = true;
		holdUntil = Date.now() + HOLD_MS;
		try {
			if (existing?.reactedByMe) {
				const rkey = rkeyOf(existing.viewerReactionUri);
				if (!rkey) return;
				local = local
					.map((r) =>
						r.emoji === emoji
							? { ...r, count: r.count - 1, reactedByMe: false, viewerReactionUri: undefined }
							: r,
					)
					.filter((r) => r.count > 0);
				await deleteRecord(REACTION, rkey);
			} else {
				local = existing
					? local.map((r) =>
							r.emoji === emoji ? { ...r, count: r.count + 1, reactedByMe: true } : r,
						)
					: [...local, { emoji, count: 1, reactedByMe: true }];
				const res = await createReaction({ uri, cid }, emoji);
				local = local.map((r) =>
					r.emoji === emoji ? { ...r, viewerReactionUri: res.data.uri } : r,
				);
			}
		} catch {
			local = snapshot;
		} finally {
			busy = false;
		}
	}
</script>

<div class="reactions">
	{#each local as reaction (reaction.emoji)}
		<button
			class:active={reaction.reactedByMe}
			aria-pressed={reaction.reactedByMe ?? false}
			aria-label={`${reaction.emoji} でリアクション`}
			onclick={() => toggle(reaction.emoji)}>{reaction.emoji} {reaction.count}</button
		>
	{/each}
	<div class="picker-wrap">
		<button class="add" aria-label="リアクションを追加" onclick={() => (pickerOpen = !pickerOpen)}
			>＋</button
		>
		{#if pickerOpen}<EmojiPicker select={toggle} />{/if}
	</div>
</div>
