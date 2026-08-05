<script lang="ts">
	import type { ActorView, EmojiView, ReactionView } from '$lib/api/types';
	import { session } from '$lib/oauth/session.svelte';
	import { createReaction, deleteRecord } from '$lib/atproto/records';
	import { displayEmojiName } from '$lib/atproto/bluemoji';
	import { myProfile } from '$lib/profile/me.svelte';
	import AvatarLink from './AvatarLink.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import BluemojiMedia from './BluemojiMedia.svelte';
	import QuickEmojiPalette from './QuickEmojiPalette.svelte';
	let {
		uri,
		cid,
		reactions = [],
		pickerOpen = $bindable(false),
		pickerAnchor,
		ontoggled,
		onpickerclose,
		showReactors = true,
	}: {
		uri: string;
		cid: string;
		reactions?: ReactionView[];
		pickerOpen?: boolean;
		pickerAnchor?: HTMLElement;
		ontoggled?: (active: boolean) => void;
		onpickerclose?: () => void;
		showReactors?: boolean;
	} = $props();
	const REACTION = 'com.suibari.nagi.reaction';
	// The appview only learns about reactions via jetstream (a few seconds behind),
	// so we keep an optimistic local copy and ignore prop-driven resets for a while
	// after a local toggle — otherwise the next feed refresh would undo the click.
	const HOLD_MS = 15_000;
	// svelte-ignore state_referenced_locally -- initial snapshot; kept in sync by the $effect below
	let local = $state<ReactionView[]>([...reactions]);
	let holdUntil = 0;
	let unavailable = $state<string[]>([]);
	$effect(() => {
		const incoming = reactions;
		if (Date.now() >= holdUntil) local = [...incoming];
	});
	const rkeyOf = (u?: string) => u?.split('/').pop();
	// カスタム絵文字は同じ :name: でも作者ごとに別物なので、item の URI で区別する。
	const keyOf = (reaction: ReactionView) => reaction.bluemoji?.uri ?? reaction.emoji;
	const reactedByViewer = (reaction: ReactionView) =>
		reaction.reactedByMe ||
		Boolean($session?.did && reaction.reactors.some((actor) => actor.did === $session?.did));
	const labelOf = (reaction: ReactionView) =>
		reaction.bluemoji ? displayEmojiName(reaction.bluemoji.name) : reaction.emoji;
	// Shift+クリックの連続リアクションを取りこぼさないよう、直列化して順に流す。
	// 早期 return で捨てると、同じ絵文字の on→off が viewerReactionUri 未確定のまま
	// 削除に入って無言で失敗する。
	let queue: Promise<void> = Promise.resolve();
	function toggle(raw: string | EmojiView) {
		if (!$session) {
			location.href = '/login';
			return;
		}
		queue = queue.then(() => run(raw)).catch(() => undefined);
	}
	async function run(raw: string | EmojiView) {
		if (!$session) return;
		const custom = typeof raw === 'string' ? undefined : raw;
		const emoji = custom ? custom.name : (raw as string).normalize('NFC');
		const key = custom ? custom.uri : emoji;
		const existing = local.find((r) => keyOf(r) === key);
		const snapshot = local.map((r) => ({ ...r, reactors: [...r.reactors] }));
		const viewerDid = $session.did;
		// 楽観表示用の自分。AppView が追いつくまでの間もアバターを出したいので、
		// 同じ投稿の既存リアクター → 自分のプロフィール → DIDだけ、の順で埋める。
		const viewer =
			local.flatMap((reaction) => reaction.reactors).find((actor) => actor.did === viewerDid) ??
			(myProfile.current?.did === viewerDid
				? ({
						did: viewerDid,
						handle: myProfile.current.handle,
						displayName: myProfile.current.displayName,
						avatar: myProfile.current.avatar,
					} satisfies ActorView)
				: ({ did: viewerDid, handle: viewerDid } satisfies ActorView));
		holdUntil = Date.now() + HOLD_MS;
		try {
			if (existing && reactedByViewer(existing)) {
				const rkey = rkeyOf(existing.viewerReactionUri);
				if (!rkey) return;
				local = local
					.map((r) =>
						keyOf(r) === key
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
				ontoggled?.(local.some(reactedByViewer));
			} else {
				local = existing
					? local.map((r) =>
							keyOf(r) === key
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
					: [
							...local,
							{
								emoji,
								...(custom ? { bluemoji: custom } : {}),
								reactors: [viewer],
								reactedByMe: true,
							},
						];
				const res = await createReaction({ uri, cid }, custom ?? emoji);
				local = local.map((r) =>
					keyOf(r) === key ? { ...r, viewerReactionUri: res.data.uri } : r,
				);
				ontoggled?.(true);
			}
		} catch {
			local = snapshot;
		}
	}
</script>

{#if local.length}
	<div class="reactions">
		{#each local as reaction (keyOf(reaction))}
			<div class="reaction-group">
				<button
					class="reaction-emoji"
					class:active={reactedByViewer(reaction)}
					aria-pressed={reactedByViewer(reaction)}
					aria-label={m.reactWithAria({ emoji: labelOf(reaction) })}
					onclick={() => toggle(reaction.bluemoji ?? reaction.emoji)}
				>
					{#if reaction.bluemoji && !unavailable.includes(reaction.bluemoji.uri)}
						<BluemojiMedia
							class="reaction-image"
							emoji={reaction.bluemoji}
							onunavailable={() => (unavailable = [...unavailable, reaction.bluemoji!.uri])}
						/>
					{:else}
						{labelOf(reaction)}
					{/if}
				</button>
				{#if showReactors}
					<div class="reaction-actors">
						{#each reaction.reactors as actor (actor.did)}
							<AvatarLink
								{actor}
								size="small"
								className="reaction-avatar"
								ariaLabel={m.viewProfileOfAria({
									name: actor.displayName ?? actor.handle,
								})}
								title={actor.displayName ?? actor.handle}
							/>
						{/each}
						{#if reaction.hasMoreReactors}<span
								class="reaction-more"
								aria-label={m.moreReactorsAria()}>…</span
							>{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<QuickEmojiPalette
	bind:open={pickerOpen}
	anchor={pickerAnchor}
	select={toggle}
	close={onpickerclose}
/>
