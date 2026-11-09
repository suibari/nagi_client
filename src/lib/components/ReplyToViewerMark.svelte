<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
</script>

<!--
	自分への返信の吹き出しの上に置く一行。チャットアプリの「返信先」と同じ位置に出す。
	背景や縁の色は「誰の発言か」を表しているので使わず、文字で伝える。
-->
<p class="reply-to-viewer">
	<Icon name="reply" size={13} />
	<span>{m.replyToViewer()}</span>
</p>

<style>
	.reply-to-viewer {
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 0 0 4px;
		/* 吹き出しの左端に揃える: アバター(40px) + 間隔(12px) + 少し内側へ。 */
		padding-inline-start: 54px;
		color: var(--accent-strong);
		font-size: 12px;
		font-weight: 700;
		line-height: 1.3;
	}
</style>
