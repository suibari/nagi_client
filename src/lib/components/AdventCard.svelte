<script lang="ts">
	import type { AdventCardView } from '$lib/api/types';
	import { adventComment, adventTitle, type AdventLocale } from '$lib/advent/advent';
	import { m } from '$lib/i18n/i18n.svelte';

	/**
	 * アドカレのクリスマスカードの表面。Make it a Quote のように、左にアバター写真、
	 * 右に見出しと botたんの一言。共有用の PNG（api/advent-card.tsx）と同じ構図にしてある。
	 *
	 * 文字は cqw で指定し、カードの幅に合わせて画像のように拡大縮小させる。
	 */
	let { card, locale }: { card: AdventCardView; locale: AdventLocale } = $props();

	const name = $derived(card.actor.displayName || card.actor.handle);
	const initial = $derived((name || '○').slice(0, 1));
	let avatarFailed = $state(false);
</script>

<article class="advent-card" aria-label={m.adventCardAria({ day: card.day, name })}>
	<div class="photo" aria-hidden="true">
		{#if card.actor.avatar && !avatarFailed}
			<img src={card.actor.avatar} alt="" onerror={() => (avatarFailed = true)} />
		{:else}
			<span class="initial">{initial}</span>
		{/if}
	</div>
	<div class="snow" aria-hidden="true"></div>
	<div class="body">
		<p class="label">
			<span class="date">12.{String(card.day).padStart(2, '0')}</span>
			<span>{m.adventCardLabel()}</span>
		</p>
		<h3 class="title">{adventTitle(card, locale)}</h3>
		<p class="comment">{adventComment(card, locale)}</p>
		<p class="from">
			<span class="dash">—</span>
			<span class="name">{name}</span>
			<span class="handle">@{card.actor.handle}</span>
		</p>
	</div>
	<img class="bot" src="/advent/bot-santa.webp" alt="" aria-hidden="true" />
</article>

<style>
	.advent-card {
		container-type: inline-size;
		position: relative;
		aspect-ratio: 1200 / 630;
		width: 100%;
		overflow: hidden;
		border-radius: 2.2cqw;
		background: linear-gradient(135deg, var(--advent-card-bg) 40%, var(--advent-card-bg-2));
		color: var(--advent-cream);
		isolation: isolate;
	}
	/* 金の縁は写真より手前に重ねる（写真が左端まで敷かれるため）。 */
	.advent-card::after {
		content: '';
		position: absolute;
		inset: 0.85cqw;
		z-index: 2;
		border: 0.35cqw solid var(--advent-gold);
		border-radius: 1.6cqw;
		pointer-events: none;
	}
	.photo {
		position: absolute;
		inset: 0 auto 0 0;
		width: 38%;
		display: grid;
		place-items: center;
		background: var(--advent-pine-dark);
		/* 写真の右端をカードの地へ溶かす。 */
		mask-image: linear-gradient(90deg, #000 55%, transparent);
	}
	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.initial {
		font-size: 16cqw;
		font-weight: 700;
		color: var(--advent-gold-soft);
	}
	.snow {
		position: absolute;
		inset: 0;
		z-index: -1;
		background-image:
			radial-gradient(circle at 20% 30%, var(--advent-snow) 0.15cqw, transparent 0.2cqw),
			radial-gradient(circle at 70% 60%, var(--advent-snow) 0.12cqw, transparent 0.17cqw),
			radial-gradient(circle at 45% 85%, var(--advent-snow) 0.1cqw, transparent 0.15cqw);
		background-size: 9cqw 9cqw;
		opacity: 0.35;
	}
	.body {
		position: absolute;
		inset: 5.5cqw 5cqw 5cqw 40%;
		display: flex;
		flex-direction: column;
		gap: 1.6cqw;
	}
	.label {
		display: flex;
		align-items: baseline;
		gap: 1.2cqw;
		margin: 0;
		font-size: 1.9cqw;
		font-weight: 700;
		color: var(--advent-gold);
		letter-spacing: 0.05em;
	}
	.date {
		font-size: 2.6cqw;
	}
	.title {
		margin: 0;
		font-size: 4.6cqw;
		line-height: 1.3;
		font-weight: 700;
		color: var(--advent-cream);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.comment,
	.from {
		/* 右下の botたんに重ならない幅。 */
		max-width: 60%;
	}
	.comment {
		margin: 0;
		font-size: 2.15cqw;
		line-height: 1.6;
		color: var(--advent-cream-muted);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 5;
		line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.from {
		margin: auto 0 0;
		display: flex;
		align-items: baseline;
		gap: 0.8cqw;
		min-width: 0;
		font-size: 2.3cqw;
	}
	.dash {
		color: var(--advent-gold);
	}
	.name {
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}
	.handle {
		font-size: 1.7cqw;
		color: var(--advent-cream-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex-shrink: 1;
	}
	.bot {
		position: absolute;
		right: 1.5cqw;
		bottom: -1cqw;
		height: 64%;
		width: auto;
		pointer-events: none;
	}
</style>
