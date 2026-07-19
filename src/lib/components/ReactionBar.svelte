<script lang="ts">
	import type { ActorView, ReactionView } from '$lib/api/types';
	import { session } from '$lib/oauth/session.svelte';
	import { createReaction, deleteRecord } from '$lib/atproto/records';
	import EmojiPicker from './EmojiPicker.svelte';
	import Avatar from './Avatar.svelte';
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
	let addButton = $state<HTMLButtonElement>();
	$effect(() => {
		const incoming = reactions;
		if (Date.now() >= holdUntil) local = [...incoming];
	});
	const rkeyOf = (u?: string) => u?.split('/').pop();
	const reactedByViewer = (reaction: ReactionView) =>
		reaction.reactedByMe ||
		Boolean($session?.did && reaction.reactors.some((actor) => actor.did === $session?.did));
	async function toggle(raw: string) {
		if (!$session) {
			location.href = '/login';
			return;
		}
		if (busy) return;
		pickerOpen = false;
		const emoji = raw.normalize('NFC');
		const existing = local.find((r) => r.emoji === emoji);
		const snapshot = local.map((r) => ({ ...r, reactors: [...r.reactors] }));
		const viewerDid = $session.did;
		const viewer =
			local.flatMap((reaction) => reaction.reactors).find((actor) => actor.did === viewerDid) ??
			({ did: viewerDid, handle: viewerDid } satisfies ActorView);
		busy = true;
		holdUntil = Date.now() + HOLD_MS;
		try {
			if (existing && reactedByViewer(existing)) {
				const rkey = rkeyOf(existing.viewerReactionUri);
				if (!rkey) return;
				local = local
					.map((r) =>
						r.emoji === emoji
							? {
									...r,
									reactors: r.reactors.filter((actor) => actor.did !== viewerDid),
									reactedByMe: false,
									viewerReactionUri: undefined,
								}
							: r,
					)
					.filter((r) => r.reactors.length > 0 || r.hasMoreReactors);
				await deleteRecord(REACTION, rkey);
			} else {
				local = existing
					? local.map((r) =>
							r.emoji === emoji
								? {
										...r,
										reactors: [
											viewer,
											...r.reactors.filter((actor) => actor.did !== viewerDid),
										].slice(0, 5),
										hasMoreReactors: r.hasMoreReactors || r.reactors.length >= 5 || undefined,
										reactedByMe: true,
									}
								: r,
						)
					: [...local, { emoji, reactors: [viewer], reactedByMe: true }];
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
		<div class="reaction-group">
			<button
				class="reaction-emoji"
				class:active={reactedByViewer(reaction)}
				aria-pressed={reactedByViewer(reaction)}
				aria-label={`${reaction.emoji} でリアクション`}
				onclick={() => toggle(reaction.emoji)}>{reaction.emoji}</button
			>
			<div class="reaction-actors">
				{#each reaction.reactors as actor (actor.did)}
					<a
						class="reaction-avatar"
						href={`/profile/${actor.did}`}
						aria-label={`${actor.displayName ?? actor.handle}のプロフィールを見る`}
						title={actor.displayName ?? actor.handle}><Avatar {actor} size="small" /></a
					>
				{/each}
				{#if reaction.hasMoreReactors}<span
						class="reaction-more"
						aria-label="ほかにもリアクションした人がいます">…</span
					>{/if}
			</div>
		</div>
	{/each}
	<div class="picker-wrap">
		<button
			bind:this={addButton}
			class="add"
			aria-label="リアクションを追加"
			aria-expanded={pickerOpen}
			onclick={() => (pickerOpen = !pickerOpen)}>＋</button
		>
		{#if pickerOpen && addButton}
			<button
				class="emoji-picker-backdrop"
				aria-label="絵文字パレットを閉じる"
				onclick={() => (pickerOpen = false)}
			></button>
			<EmojiPicker anchor={addButton} select={toggle} close={() => (pickerOpen = false)} />
		{/if}
	</div>
</div>
