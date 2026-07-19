<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import ReactionBar from './ReactionBar.svelte';
	import Avatar from './Avatar.svelte';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import TranslateToggle from './TranslateToggle.svelte';
	import QuoteCard from './QuoteCard.svelte';
	import PostDeleteDialog from './PostDeleteDialog.svelte';
	import { deleteRecord } from '$lib/atproto/records';
	import Icon from './shell/Icon.svelte';
	let {
		post,
		compact = false,
		ondeleted,
	}: { post: PostView; compact?: boolean; ondeleted?: (uri: string) => void } = $props();
	let expanded = $state(false);
	let deleteOpen = $state(false);
	let deleting = $state(false);
	let deleteError = $state('');
	let mine = $derived($session?.did === post.author.did);
	let threadHref = $derived(`/thread/${post.author.did}/${post.uri.split('/').pop()}`);
	const resolve = (url?: string) => (url?.startsWith('/') ? APPVIEW_URL + url : (url ?? ''));
	async function removePost() {
		if (deleting) return;
		const match = /^at:\/\/[^/]+\/(com\.suibari\.nagi\.post)\/([^/]+)$/.exec(post.uri);
		if (!match) {
			deleteError = m.deletePostFailed();
			return;
		}
		deleting = true;
		deleteError = '';
		try {
			await deleteRecord(match[1], match[2]);
			deleteOpen = false;
			ondeleted?.(post.uri);
		} catch (error) {
			deleteError = error instanceof Error ? error.message : m.deletePostFailed();
		} finally {
			deleting = false;
		}
	}
</script>

<div class="post-row" class:mine class:bot={post.isBot}>
	<a href={`/profile/${post.author.did}`} aria-label={m.viewProfileAria()}
		><Avatar actor={post.author} size={compact ? 'small' : undefined} /></a
	>
	<div class="bubble">
		<div class="meta">
			<a href={`/profile/${post.author.did}`}>{post.author.displayName ?? post.author.handle}</a
			>{#if post.isBot}<span class="badge">{m.botBadge()}</span>{/if}<time
				><a href={threadHref}
					>{new Date(post.createdAt).toLocaleString(dateLocale(), {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})}</a
				></time
			>{#if mine && !post.deleted}<button
					class="post-delete ghost"
					type="button"
					aria-label={m.deletePostAria()}
					onclick={() => {
						deleteError = '';
						deleteOpen = true;
					}}><Icon name="trash" size={16} /></button
				>{/if}
		</div>
		<TranslateToggle
			uri={post.uri}
			text={post.text}
			langs={post.langs}
			deleted={post.deleted}
			collapsed={!expanded}
		/>
		{#if post.text.length > 220}<button class="read" onclick={() => (expanded = !expanded)}
				>{expanded ? m.readLess() : m.readMore()}</button
			>{/if}{#if post.images?.length}<div class="images">
				{#each post.images as image}<img src={resolve(image.url)} alt={image.alt} />{/each}
			</div>{/if}{#if post.quote}<QuoteCard post={post.quote} />{/if}<ReactionBar
			uri={post.uri}
			cid={post.cid}
			reactions={post.reactions}
		/>
	</div>
</div>
{#if deleteOpen}
	<PostDeleteDialog
		busy={deleting}
		error={deleteError}
		onconfirm={() => void removePost()}
		oncancel={() => (deleteOpen = false)}
	/>
{/if}
