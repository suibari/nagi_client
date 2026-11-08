<script lang="ts">
	import { onMount } from 'svelte';
	import type { AdventCardView } from '$lib/api/types';
	import {
		adventComment,
		adventShareUrl,
		adventTitle,
		type AdventLocale,
	} from '$lib/advent/advent';
	import { postPageHref } from '$lib/feed/post-follow.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import AdventCard from './AdventCard.svelte';
	import Button from './Button.svelte';
	import Icon from './shell/Icon.svelte';

	/** カードの拡大表示。リンク（OGP はこのカードの画像）を Nagi / Bluesky へシェアできる。 */
	let {
		card,
		onclose,
		arrived = false,
	}: {
		card: AdventCardView;
		onclose: () => void;
		/** 手紙の開封演出から来たとき。カードが下から浮かび上がる動きを省く。 */
		arrived?: boolean;
	} = $props();

	const locale = $derived<AdventLocale>(i18n.locale === 'ja' ? 'ja' : 'en');
	const mine = $derived(card.actor.did === $session?.did);
	const shareUrl = $derived(
		adventShareUrl(typeof location === 'undefined' ? '' : location.origin, card.day, locale),
	);
	const shareText = $derived(
		m.adventShareText({ day: card.day, title: adventTitle(card, locale) }),
	);
	let copied = $state(false);
	let closeButton = $state<HTMLElement>();

	onMount(() => {
		closeButton?.focus();
	});

	function shareToNagi() {
		composerHost.showWithText(`${shareText}\n${shareUrl}`);
		onclose();
	}

	function shareToBluesky() {
		const text = `${shareText}\n${shareUrl}`;
		window.open(
			`https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`,
			'_blank',
			'noopener',
		);
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			copied = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onclose();
	}
</script>

<svelte:window onkeydown={keydown} />
<div class="advent-backdrop" role="presentation" onclick={backdropClick}>
	<div
		class="advent-dialog"
		class:arrived
		role="dialog"
		aria-modal="true"
		aria-labelledby="advent-dialog-title"
	>
		<div class="dialog-head">
			<h2 id="advent-dialog-title">
				{mine ? m.adventDialogTitleMine({ day: card.day }) : m.adventDialogTitle({ day: card.day })}
			</h2>
			<button
				bind:this={closeButton}
				type="button"
				class="close"
				aria-label={m.close()}
				onclick={onclose}
			>
				<Icon name="close" size={20} />
			</button>
		</div>
		<AdventCard {card} {locale} />
		<!-- スマホ幅ではカードの文字が小さくなるので、読める大きさでも添える。 -->
		<div class="readable">
			<p class="readable-title">{adventTitle(card, locale)}</p>
			<p class="readable-comment">{adventComment(card, locale)}</p>
		</div>
		{#if mine}<p class="mine-note">{m.adventMineNote()}</p>{/if}
		<div class="actions">
			{#if $session}
				<Button variant="primary" onclick={shareToNagi}>
					<Icon name="nagi" size={18} />{m.adventShareNagi()}
				</Button>
			{/if}
			<Button variant="secondary" onclick={shareToBluesky}>
				<Icon name="bluesky" size={18} />{m.adventShareBluesky()}
			</Button>
			<Button variant="ghost" onclick={copyLink}>
				<Icon name={copied ? 'check' : 'link'} size={18} />{copied
					? m.adventLinkCopied()
					: m.adventCopyLink()}
			</Button>
		</div>
		{#if card.postUri}
			<a class="post-link" href={postPageHref({ uri: card.postUri })} onclick={onclose}
				>{m.adventViewPost()} →</a
			>
		{/if}
	</div>
</div>

<style>
	.advent-backdrop {
		position: fixed;
		inset: 0;
		z-index: 120;
		display: grid;
		place-items: center;
		padding: 16px;
		background: var(--advent-veil);
	}
	.advent-dialog {
		display: grid;
		gap: 14px;
		inline-size: min(100%, 720px);
		max-block-size: 92dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 16px;
		border-radius: var(--radius-l);
		background: var(--advent-night);
		color: var(--advent-cream);
		box-shadow: var(--shadow-pop);
		animation: rise 320ms cubic-bezier(0.2, 0.8, 0.3, 1);
	}
	.advent-dialog.arrived {
		animation: none;
	}
	.dialog-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	h2 {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--advent-gold-soft);
	}
	.close {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--advent-cream);
		cursor: pointer;
	}
	.close:hover {
		background: var(--advent-pine-dark);
	}
	.readable {
		display: none;
	}
	@media (max-width: 600px) {
		.readable {
			display: grid;
			gap: 4px;
		}
	}
	.readable p {
		margin: 0;
	}
	.readable-title {
		font-weight: 700;
		color: var(--advent-cream);
	}
	.readable-comment {
		font-size: 0.92rem;
		line-height: 1.6;
		color: var(--advent-cream-muted);
	}
	.mine-note {
		margin: 0;
		font-size: 0.9rem;
		color: var(--advent-cream-muted);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.actions :global(.btn) {
		gap: 6px;
	}
	.actions :global(.btn-secondary),
	.actions :global(.btn-ghost) {
		color: var(--advent-cream);
		border-color: var(--advent-pine-light);
		background: transparent;
	}
	.actions :global(.btn-secondary:hover:not(:disabled)),
	.actions :global(.btn-ghost:hover:not(:disabled)) {
		background: var(--advent-pine-dark);
		color: var(--advent-cream);
	}
	.post-link {
		justify-self: start;
		font-size: 0.9rem;
		color: var(--advent-gold);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.98);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.advent-dialog {
			animation: none;
		}
	}
</style>
