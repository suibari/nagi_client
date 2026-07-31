<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './Icon.svelte';

	/**
	 * 左サイドバー内の投稿ボタン（PC・タブレット）。
	 *
	 * 浮かせず列の中に置く。position: fixed で外から重ねると、サイドバーの幅・余白を
	 * 数値で推測することになり、アカウントカードと幅も間隔も揃わなかった。
	 * スマホはサイドバーごと消えるので、そちらは PostFab（浮かぶ＋ボタン）が担当する。
	 */
	let { onclick }: { onclick: () => void } = $props();
</script>

<button class="post-button" type="button" title={m.postFabLabel()} {onclick}>
	<Icon name="send" size={18} />
	<span class="label">{m.postFabLabel()}</span>
</button>

<style>
	.post-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		/* アカウントカード（.account-card）と同じ左右マージンで縦を揃える。 */
		margin: 0 6px 12px;
		padding: 12px 16px;
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--accent);
		color: var(--text-on-accent);
		font-size: 15px;
		font-weight: 800;
		cursor: pointer;
		transition: background 0.14s ease;
	}

	.post-button:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* --- tablet: アイコンレールになるのでラベルを畳んで丸にする --- */
	@media (max-width: 1099px) {
		.post-button {
			align-self: center;
			width: 48px;
			height: 48px;
			margin-inline: 0;
			padding: 0;
		}

		.label {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
	}

	@media (hover: hover) and (pointer: fine) {
		.post-button:hover {
			background: var(--accent-strong);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.post-button {
			transition: none;
		}
	}
</style>
