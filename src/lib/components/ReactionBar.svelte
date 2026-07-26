<script lang="ts">
	import type { ActorView, EmojiView, ReactionView } from '$lib/api/types';
	import { session } from '$lib/oauth/session.svelte';
	import { createReaction, deleteRecord } from '$lib/atproto/records';
	import { displayEmojiName, resolveEmojiUrl } from '$lib/atproto/bluemoji';
	import { myProfile } from '$lib/profile/me.svelte';
	import EmojiPicker from './EmojiPicker.svelte';
	import Avatar from './Avatar.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	import { onMount, untrack } from 'svelte';
	import {
		buildQuickReactionChoices,
		frequentReactionChoices,
		loadCustomSuggestionPool,
		loadReactionUsage,
		reactionChoiceKey,
		recordReactionUsage,
		SAFE_UNICODE_REACTIONS,
		type ReactionChoice,
		type ReactionUsage,
	} from '$lib/emoji/reactionUsage';
	let {
		uri,
		cid,
		reactions = [],
		pickerOpen = $bindable(false),
		pickerAnchor,
	}: {
		uri: string;
		cid: string;
		reactions?: ReactionView[];
		pickerOpen?: boolean;
		pickerAnchor?: HTMLElement;
	} = $props();
	const REACTION = 'com.suibari.nagi.reaction';
	// The appview only learns about reactions via jetstream (a few seconds behind),
	// so we keep an optimistic local copy and ignore prop-driven resets for a while
	// after a local toggle — otherwise the next feed refresh would undo the click.
	const HOLD_MS = 15_000;
	// svelte-ignore state_referenced_locally -- initial snapshot; kept in sync by the $effect below
	let local = $state<ReactionView[]>([...reactions]);
	let holdUntil = 0;
	let busy = $state(false);
	let fullPickerOpen = $state(false);
	let usage = $state<ReactionUsage[]>([]);
	let failedCustomUris = $state<string[]>([]);
	let quickPickerStyle = $state('');
	let quickItems = $state<ReactionChoice[]>([]);
	let quickLoading = $state(false);
	let pickerGeneration = 0;
	let frequentItems = $derived(frequentReactionChoices(usage, 8, failedCustomUris));
	onMount(() => {
		usage = loadReactionUsage();
	});
	$effect(() => {
		const incoming = reactions;
		if (Date.now() >= holdUntil) local = [...incoming];
	});
	$effect(() => {
		if (!pickerOpen || fullPickerOpen) return;
		const generation = ++pickerGeneration;
		const usageSnapshot = untrack(loadReactionUsage);
		usage = usageSnapshot;
		const failedSnapshot = untrack(() => failedCustomUris);
		quickItems = [];
		quickLoading = true;
		void loadCustomSuggestionPool().then((customPool) => {
			if (generation !== pickerGeneration || !pickerOpen || fullPickerOpen) return;
			quickItems = buildQuickReactionChoices(usageSnapshot, customPool, failedSnapshot);
			quickLoading = false;
		});
		return () => {
			pickerGeneration += 1;
		};
	});
	$effect(() => {
		if (!pickerOpen || !pickerAnchor || fullPickerOpen) return;
		const updatePosition = () => {
			const rect = pickerAnchor.getBoundingClientRect();
			const margin = 12;
			const width = Math.min(336, window.innerWidth - margin * 2);
			const left = Math.min(Math.max(margin, rect.left), window.innerWidth - margin - width);
			const estimatedHeight = 100;
			const openAbove = rect.top > estimatedHeight + margin;
			const top = openAbove ? rect.top - estimatedHeight - 8 : rect.bottom + 8;
			quickPickerStyle = `top:${Math.max(margin, top)}px;left:${left}px;width:${width}px;`;
		};
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closePicker();
		};
		updatePosition();
		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			window.removeEventListener('keydown', handleKeydown);
		};
	});
	const rkeyOf = (u?: string) => u?.split('/').pop();
	// カスタム絵文字は同じ :name: でも作者ごとに別物なので、item の URI で区別する。
	const keyOf = (reaction: ReactionView) => reaction.bluemoji?.uri ?? reaction.emoji;
	const reactedByViewer = (reaction: ReactionView) =>
		reaction.reactedByMe ||
		Boolean($session?.did && reaction.reactors.some((actor) => actor.did === $session?.did));
	const labelOf = (reaction: ReactionView) =>
		reaction.bluemoji ? displayEmojiName(reaction.bluemoji.name) : reaction.emoji;
	function closePicker() {
		pickerOpen = false;
		fullPickerOpen = false;
		requestAnimationFrame(() => pickerAnchor?.focus());
	}
	function markCustomUnavailable(uri: string) {
		if (!failedCustomUris.includes(uri)) failedCustomUris = [...failedCustomUris, uri];
		const failedIndex = quickItems.findIndex(
			(item) => item.kind === 'custom' && item.emoji.uri === uri,
		);
		if (failedIndex < 0) return;
		const remaining = quickItems.filter((item) => item.kind !== 'custom' || item.emoji.uri !== uri);
		const used = new Set(remaining.map(reactionChoiceKey));
		const fallback = SAFE_UNICODE_REACTIONS.find((emoji) => !used.has(emoji));
		if (!fallback) {
			quickItems = remaining;
			return;
		}
		remaining.splice(failedIndex, 0, { kind: 'unicode', emoji: fallback });
		quickItems = remaining.slice(0, 6);
	}
	async function toggle(raw: string | EmojiView) {
		if (!$session) {
			location.href = '/login';
			return;
		}
		if (busy) return;
		pickerOpen = false;
		fullPickerOpen = false;
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
		busy = true;
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
				usage = recordReactionUsage(loadReactionUsage(), raw);
				local = local.map((r) =>
					keyOf(r) === key ? { ...r, viewerReactionUri: res.data.uri } : r,
				);
			}
		} catch {
			local = snapshot;
		} finally {
			busy = false;
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
					{#if reaction.bluemoji}
						<img
							class="reaction-image"
							src={resolveEmojiUrl(reaction.bluemoji.url)}
							alt={reaction.bluemoji.alt ?? labelOf(reaction)}
							title={labelOf(reaction)}
							loading="lazy"
						/>
					{:else}
						{reaction.emoji}
					{/if}
				</button>
				<div class="reaction-actors">
					{#each reaction.reactors as actor (actor.did)}
						<a
							class="reaction-avatar"
							href={`/profile/${actor.did}`}
							aria-label={m.viewProfileOfAria({ name: actor.displayName ?? actor.handle })}
							title={actor.displayName ?? actor.handle}><Avatar {actor} size="small" /></a
						>
					{/each}
					{#if reaction.hasMoreReactors}<span
							class="reaction-more"
							aria-label={m.moreReactorsAria()}>…</span
						>{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if pickerOpen && pickerAnchor}
	{#if fullPickerOpen}
		<button class="emoji-picker-backdrop" aria-label={m.closeEmojiAria()} onclick={closePicker}
		></button>
		<EmojiPicker
			anchor={pickerAnchor}
			select={toggle}
			close={closePicker}
			frequent={frequentItems}
			oncustomunavailable={markCustomUnavailable}
		/>
	{:else}
		<button class="reaction-picker-backdrop" aria-label={m.closeEmojiAria()} onclick={closePicker}
		></button>
		<div
			class="reaction-quick-picker"
			style={quickPickerStyle}
			role="dialog"
			aria-label={m.quickReactionAria()}
			aria-busy={quickLoading}
		>
			{#if quickLoading}
				<div class="reaction-quick-loading" role="status">{m.loading()}</div>
			{:else}
				<div class="reaction-quick-grid">
					{#each quickItems as item (reactionChoiceKey(item))}
						<button
							class="reaction-quick-item"
							aria-label={m.reactWithAria({
								emoji: item.kind === 'custom' ? displayEmojiName(item.emoji.name) : item.emoji,
							})}
							onclick={() => toggle(item.emoji)}
						>
							{#if item.kind === 'custom'}
								<img
									src={resolveEmojiUrl(item.emoji.url)}
									alt={item.emoji.alt ?? displayEmojiName(item.emoji.name)}
									title={displayEmojiName(item.emoji.name)}
									onerror={() => markCustomUnavailable(item.emoji.uri)}
								/>
							{:else}
								{item.emoji}
							{/if}
						</button>
					{/each}
				</div>
			{/if}
			<button class="reaction-show-all" onclick={() => (fullPickerOpen = true)}>
				<Icon name="emoji" size={17} />
				<span>{m.showAllReactions()}</span>
			</button>
		</div>
	{/if}
{/if}
