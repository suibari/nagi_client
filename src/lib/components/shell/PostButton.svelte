<script lang="ts">
	import Button from '$lib/components/Button.svelte';
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

<Button variant="primary" size="lg" class="post-button" title={m.postFabLabel()} {onclick}>
	<Icon name="send" size={18} />
	<span class="label">{m.postFabLabel()}</span>
</Button>

<style>
	/* 色・形・ホバーは Button に任せ、ここではサイドバーの中での置き方だけを持つ。 */
	:global(.post-button) {
		/* アカウントカード（.account-card）と同じ左右マージンで縦を揃える。 */
		margin: 0 6px 12px;
	}

	/* --- tablet: アイコンレールになるのでラベルを畳んで丸にする --- */
	@media (max-width: 899px) {
		:global(.post-button) {
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
</style>
