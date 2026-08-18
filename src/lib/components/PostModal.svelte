<script lang="ts">
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import Composer from './Composer.svelte';
	import PostModalShell from './PostModalShell.svelte';

	/**
	 * ポストモーダル。
	 *
	 * Composer は開いていない間も破棄しない。{#if} で作り直すと ImageAttachmentEditor が
	 * アンマウント時に Object URL を解放してしまい、閉じて開き直しただけで添付画像の
	 * プレビューと書きかけが失われる（ComposerEditor のプレビュー切替が hidden なのも同じ理由）。
	 * 開閉は表示の切り替えだけで行う。
	 */
	let mode = $state<'simple' | 'rich'>('simple');
	let wasOpen = $state(false);
	let sending = $state(false);
	let publishingPreferencesVersion = $state(0);

	// 投稿できたことを表示中のフィードへ伝えるだけ。画面をどこへ寄せるか（寄せられない
	// ときに導線を出すか）は Composer が postFollow へ預けている。
	function postSucceeded() {
		postedSignal.notify();
		composerHost.hide();
	}

	// 開くたびに「あっさり」へ戻す。日常の投稿は短文が圧倒的に多く、
	// 毎回同じ場所に同じものが出る予測可能性を優先する。
	$effect(() => {
		if (composerHost.open === wasOpen) return;
		wasOpen = composerHost.open;
		if (composerHost.open) {
			mode = 'simple';
			publishingPreferencesVersion += 1;
		}
	});
</script>

<PostModalShell bind:mode open={composerHost.open} {sending} onclose={() => composerHost.hide()}>
	<Composer
		{mode}
		{publishingPreferencesVersion}
		channel={composerHost.channel}
		defaultScope={composerHost.defaultScope}
		onsendingchange={(value) => (sending = value)}
		onposted={postSucceeded}
	/>
</PostModalShell>
