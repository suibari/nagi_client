<script lang="ts">
	import type { ActorView, PostView } from '$lib/api/types';
	import { guestPosts } from '$lib/guest-posts/guest-posts.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import Icon from './shell/Icon.svelte';
	let { botActor }: { botActor?: ActorView } = $props();
	const localActor: ActorView = { did: 'local:guest', handle: 'local', displayName: '' };
	const fallbackBot: ActorView = {
		did: 'did:web:bot-tan.com',
		handle: 'bot-tan.com',
		displayName: 'botたん',
		isBot: true,
	};
	const hasReply = $derived(guestPosts.entries.some((entry) => Boolean(entry.reply)));
	const view = (entry: (typeof guestPosts.entries)[number], reply = false): PostView => ({
		uri: `local://${entry.id}${reply ? '/reply' : ''}`,
		cid: `${entry.id}${reply ? '-reply' : ''}`,
		author: reply ? (botActor ?? fallbackBot) : localActor,
		text: reply ? (entry.reply ?? '') : entry.text,
		langs: [entry.language],
		createdAt: entry.createdAt,
		indexedAt: entry.createdAt,
		reactions: [],
		isBot: reply,
		isAffirmation: reply,
		kossori: !reply,
	});
</script>

{#if guestPosts.ready && guestPosts.entries.length}
	<section class="guest-feed" aria-labelledby="guest-feed-label">
		<h2 id="guest-feed-label" class="guest-storage-label">
			<Icon name="hide" size={15} />
			<span>{m.guestPostStoredOnDevice()}</span>
		</h2>
		{#each guestPosts.entries as entry (entry.id)}
			<article class="guest-thread" id={`guest-post-${entry.id}`}>
				<ChatBubble post={view(entry)} displayOnly={true} collapsible={false} localGuest={true} />
				{#if entry.reply}
					<div class="bot-reply">
						<ChatBubble post={view(entry, true)} displayOnly={true} collapsible={false} />
					</div>
				{:else if entry.status === 'pending'}
					<p class="status" role="status">
						<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span
						>{m.guestPostWaiting()}
					</p>
				{:else}
					<p class="status error">
						{m.guestPostReplyFailed()}
						<button class="link" type="button" onclick={() => void guestPosts.retry(entry.id)}
							>{m.retry()}</button
						>
					</p>
				{/if}
				<div class="thread-actions">
					<button
						class="ghost delete"
						type="button"
						onclick={() => void guestPosts.remove(entry.id)}
						><Icon name="trash" size={15} />{m.guestPostDelete()}</button
					>
				</div>
			</article>
		{/each}
		{#if hasReply}<div class="signup-prompt">
				<div><strong>{m.guestPostSignupTitle()}</strong><span>{m.guestPostSignupBody()}</span></div>
				<a href="/login">{m.loginOrStart()}</a>
			</div>{/if}
	</section>
{/if}

<style>
	.guest-feed {
		display: grid;
		gap: 12px;
		margin: 12px 0 18px;
	}
	.guest-storage-label,
	.signup-prompt,
	.thread-actions,
	.status {
		display: flex;
		align-items: center;
	}
	.guest-storage-label {
		justify-self: start;
		gap: 6px;
		margin: 0 12px;
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 700;
	}
	.guest-thread {
		display: grid;
		gap: 8px;
		padding: 12px;
		scroll-margin-top: calc(var(--mobile-header-h) + 12px);
	}
	.bot-reply {
		margin-top: 7px;
	}
	.status {
		gap: 8px;
		margin: 10px 0 0 50px;
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	.thread-actions {
		justify-content: flex-end;
	}
	.delete {
		display: flex;
		gap: 5px;
		align-items: center;
		color: var(--text-muted);
		font-size: 0.75rem;
	}
	.signup-prompt {
		justify-content: space-between;
		gap: 14px;
		padding: 4px;
	}
	.signup-prompt > div {
		display: grid;
		gap: 3px;
	}
	.signup-prompt span {
		color: var(--text-muted);
		font-size: 0.8rem;
	}
	.signup-prompt > a {
		color: var(--accent-strong);
		font-size: 0.8rem;
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 2px;
		white-space: nowrap;
	}
	@media (max-width: 560px) {
		.signup-prompt {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
