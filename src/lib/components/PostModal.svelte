<script lang="ts">
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		COMPOSER_MODES,
		getComposerMode,
		resetComposerMode,
		setComposerMode,
		type ComposerMode,
	} from '$lib/post/composer-mode';
	import Composer from './Composer.svelte';
	import ComposerAssistant from './ComposerAssistant.svelte';
	import PostModalShell from './PostModalShell.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * ポストモーダル。
	 *
	 * Composer は開いていない間も破棄しない。{#if} で作り直すと ImageAttachmentEditor が
	 * アンマウント時に Object URL を解放してしまい、閉じて開き直しただけで添付画像の
	 * プレビューと書きかけが失われる（ComposerEditor のプレビュー切替が hidden なのも同じ理由）。
	 * 開閉は表示の切り替えだけで行う。
	 */
	let mode = $state<ComposerMode>('simple');
	let wasOpen = $state(false);
	let sending = $state(false);
	let publishingPreferencesVersion = $state(0);
	let text = $state('');
	let assistMode = $state<'affirm' | 'question'>('affirm');
	let composing = $state(false);
	let assistSpace = $state(0);
	let submittable = $state(false);
	let composer = $state<{ submit: () => Promise<void> }>();

	/**
	 * ブログにできない文脈ではタブごと出さない。返信・引用は記事本文に文脈が現れず、
	 * チャンネル投稿はその文脈を外へ出さない、という Composer 側の判定と同じ理由。
	 */
	const articleAllowed = $derived(
		!composerHost.replyTarget && !composerHost.quoteTarget && !composerHost.channel,
	);
	const modes = $derived(
		articleAllowed ? COMPOSER_MODES : COMPOSER_MODES.filter((value) => value !== 'blog'),
	);
	// 書きかけの途中で返信先が付いたときに、選べないタブへ取り残されないようにする。
	// 端末の設定は書き換えない。返信のたびに「ブログ」の選択が失われてしまうため。
	$effect(() => {
		if (!articleAllowed && mode === 'blog') mode = 'rich';
	});

	// 投稿できたことを表示中のフィードへ伝えるだけ。画面をどこへ寄せるか（寄せられない
	// ときに導線を出すか）は Composer が postFollow へ預けている。
	function postSucceeded() {
		mode = resetComposerMode();
		postedSignal.notify();
		composerHost.hide();
	}

	// 閉じただけなら前回の選択を保ち、投稿できたときだけ postSucceeded で戻す。
	$effect(() => {
		if (composerHost.open === wasOpen) return;
		wasOpen = composerHost.open;
		if (composerHost.open) {
			assistMode = 'affirm';
			composing = false;
			mode = getComposerMode();
			publishingPreferencesVersion += 1;
		}
	});
</script>

{#snippet mobileSubmit()}
	<button
		class="submit-primary post-modal-mobile-submit"
		type="button"
		disabled={!submittable}
		aria-label={sending ? m.composerSubmitting() : m.composerSubmitNagi()}
		title={sending ? m.composerSubmitting() : m.composerSubmitNagi()}
		onclick={() => void composer?.submit()}
	>
		{#if sending}<span class="submit-spinner" aria-hidden="true"></span>
		{:else}<Icon name="send" size={18} />{/if}
		<span>{sending ? m.composerSubmitting() : m.composerSubmitNagiShort()}</span>
	</button>
{/snippet}

<PostModalShell
	bind:mode
	{modes}
	open={composerHost.open}
	{sending}
	{assistSpace}
	headerAction={mobileSubmit}
	onclose={() => composerHost.hide()}
	onmodechange={setComposerMode}
>
	<Composer
		bind:this={composer}
		bind:text
		ontextinput={(event) => {
			// 変換中の削除・置換は、実際の本文削除として扱わない。
			if (composing || event.isComposing) return;
			assistMode = event.inputType?.startsWith('delete') ? 'question' : 'affirm';
		}}
		oncompositionchange={(value) => {
			composing = value;
			if (!value) assistMode = 'affirm';
		}}
		bind:submittable
		{mode}
		{publishingPreferencesVersion}
		channel={composerHost.channel}
		defaultScope={composerHost.defaultScope}
		onsendingchange={(value) => (sending = value)}
		onposted={postSucceeded}
	/>
</PostModalShell>
<ComposerAssistant
	open={composerHost.open}
	{text}
	mode={assistMode}
	paused={sending || composing}
	bind:reservedHeight={assistSpace}
/>
