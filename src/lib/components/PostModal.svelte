<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		COMPOSER_MODES,
		getComposerMode,
		isPlainPostMode,
		resetComposerMode,
		setComposerMode,
		type PostModalMode,
	} from '$lib/post/composer-mode';
	import Composer from './Composer.svelte';
	import TrilinesComposer from './TrilinesComposer.svelte';
	import ComposerAssistant from './ComposerAssistant.svelte';
	import PostModalShell from './PostModalShell.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * ポストモーダル。
	 *
	 * Composer は開いていない間も破棄しない。{#if} で作り直すと ImageAttachmentEditor が
	 * アンマウント時に Object URL を解放してしまい、閉じて開き直しただけで添付画像の
	 * プレビューと書きかけが失われる。
	 * 開閉は表示の切り替えだけで行う。
	 *
	 * ブログはここではなく BlogModal で書く（ポストと行き来する場面がほぼないため）。
	 * Composer も別インスタンスなので、書きかけはそれぞれのモーダルに残る。
	 */
	let mode = $state<PostModalMode>('simple');
	let wasOpen = $state(false);
	let sending = $state(false);
	let publishingPreferencesVersion = $state(0);
	let text = $state('');
	let assistMode = $state<'affirm' | 'question'>('affirm');
	let composing = $state(false);
	let assistSpace = $state(0);
	let submittable = $state(false);
	let composer = $state<{ submit: () => Promise<void> }>();
	let trilinesComposer = $state<{ submit: () => Promise<void> }>();
	let trilinesSubmittable = $state(false);

	/**
	 * 3行日記にできない文脈ではタブごと出さない。3行日記は返信・引用を持てない。
	 * 3行日記を編集するときは、3行日記のタブだけを出す。
	 */
	const diaryAllowed = $derived(!composerHost.replyTarget && !composerHost.quoteTarget);
	const editingDiary = $derived(Boolean(composerHost.trilinesEditTarget));
	const modes = $derived<PostModalMode[]>(
		editingDiary
			? ['diary']
			: diaryAllowed
				? COMPOSER_MODES
				: COMPOSER_MODES.filter((value) => isPlainPostMode(value)),
	);
	const diary = $derived(mode === 'diary');
	// 書きかけの途中で返信先が付いたときに、選べないタブへ取り残されないようにする。
	// 端末の設定は書き換えない。返信のたびに「3行日記」の選択が失われてしまうため。
	$effect(() => {
		if (editingDiary) mode = 'diary';
		else if (!diaryAllowed && !isPlainPostMode(mode)) mode = 'rich';
	});

	// 投稿できたことを表示中のフィードへ伝えるだけ。画面をどこへ寄せるか（寄せられない
	// ときに導線を出すか）は Composer が postFollow へ預けている。
	function postSucceeded() {
		// 日記の編集は端末のタブ設定に触れない。
		if (!editingDiary) mode = resetComposerMode();
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
			if (composerHost.trilinesEditTarget) mode = 'diary';
			publishingPreferencesVersion += 1;
		}
	});
	// シェアなどから本文を渡されたら、通常のポストの本文へ移す（書きかけは消さない）。
	$effect(() => {
		const seed = composerHost.seedText;
		if (!seed || !composerHost.open) return;
		composerHost.seedText = undefined;
		if (!isPlainPostMode(mode)) mode = 'simple';
		const current = untrack(() => text).trim();
		text = current ? `${current}\n\n${seed}` : seed;
	});
</script>

{#snippet mobileSubmit()}
	<Button
		variant="primary"
		class="submit-primary post-modal-mobile-submit"
		type="button"
		disabled={diary ? !trilinesSubmittable : !submittable}
		aria-label={sending ? m.composerSubmitting() : m.composerSubmitNagi()}
		title={sending ? m.composerSubmitting() : m.composerSubmitNagi()}
		onclick={() => void (diary ? trilinesComposer : composer)?.submit()}
	>
		{#if sending}<Spinner inline size="sm" decorative />
		{:else}<Icon name="send" size={18} />{/if}
		<span>{sending ? m.composerSubmitting() : m.composerSubmitNagiShort()}</span>
	</Button>
{/snippet}

<PostModalShell
	bind:mode
	{modes}
	open={composerHost.open}
	{sending}
	{assistSpace}
	headerAction={mobileSubmit}
	onclose={() => composerHost.hide()}
	onmodechange={(next) => {
		if (next !== 'blog' && !editingDiary) setComposerMode(next);
	}}
>
	<!--
		Composer と3行日記の入力欄は、タブを切り替えても破棄しない（書きかけと添付画像を保つため。
		冒頭のコメント参照）。表示だけを切り替える。
	-->
	<div class="composer-host" hidden={!diary}>
		<TrilinesComposer
			bind:this={trilinesComposer}
			bind:submittable={trilinesSubmittable}
			editTarget={composerHost.trilinesEditTarget}
			active={composerHost.open && diary}
			onsendingchange={(value) => (sending = value)}
			onposted={postSucceeded}
		/>
	</div>
	<div class="composer-host" hidden={diary}>
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
			defaultScope={composerHost.defaultScope}
			onsendingchange={(value) => (sending = value)}
			onposted={postSucceeded}
		/>
	</div>
</PostModalShell>
<ComposerAssistant
	open={composerHost.open && !diary}
	{text}
	mode={assistMode}
	paused={sending || composing}
	bind:reservedHeight={assistSpace}
/>

<style>
	.composer-host {
		display: contents;
	}
	.composer-host[hidden] {
		display: none;
	}
</style>
