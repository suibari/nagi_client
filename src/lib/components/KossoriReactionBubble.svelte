<script lang="ts">
	import type { ActorView, ProfileKossoriReactionItem, ReactionView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	import ReactionBar from './ReactionBar.svelte';

	let {
		item,
		actor,
		removable = false,
		onremoved,
	}: {
		item: ProfileKossoriReactionItem;
		actor: ActorView;
		removable?: boolean;
		onremoved?: () => void;
	} = $props();

	// AppView→クライアントの順でデプロイする間、旧レスポンスには emoji が無い。
	// その短い期間は従来どおり案内文だけを出し、空のリアクション枠にはしない。
	const reaction = $derived<ReactionView | undefined>(
		item.emoji
			? {
					emoji: item.emoji,
					...(item.bluemoji ? { bluemoji: item.bluemoji } : {}),
					reactors: [actor],
					...(removable ? { reactedByMe: true, viewerReactionUri: item.reactionUri } : {}),
				}
			: undefined,
	);
</script>

<article class="thread-unit reaction-kossori">
	<div class="post-row">
		<div class="avatar hidden-author" aria-hidden="true"><Icon name="hide" size={20} /></div>
		<div class="bubble">
			<p>{m.reactionKossoriHidden()}</p>
			{#if reaction}<ReactionBar
					uri=""
					cid=""
					reactions={[reaction]}
					readOnly={!removable}
					ontoggled={(active) => {
						if (!active) onremoved?.();
					}}
				/>{/if}
		</div>
	</div>
</article>

<style>
	.reaction-kossori .hidden-author {
		color: var(--text-muted);
		background: var(--surface-soft);
	}
	.reaction-kossori p {
		margin: 0;
	}
</style>
