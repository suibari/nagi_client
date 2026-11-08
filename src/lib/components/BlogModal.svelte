<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Composer from './Composer.svelte';
	import ComposerAssistant from './ComposerAssistant.svelte';
	import PostModalShell from './PostModalShell.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * ブログモーダル。ポストモーダルとは別の Composer を持ち、書きかけもこちらだけに残る。
	 *
	 * ポストモーダルと同じく、開いていない間も Composer を破棄しない（閉じて開き直すだけで
	 * 添付画像のプレビューと書きかけが失われないように）。マウントは +layout.svelte 側で
	 * 初めて開いたときに行い、以後はリロードまで残す。
	 */
	let wasOpen = $state(false);
	let sending = $state(false);
	let publishingPreferencesVersion = $state(0);
	let text = $state('');
	let assistMode = $state<'affirm' | 'question'>('affirm');
	let composing = $state(false);
	let assistSpace = $state(0);
	let submittable = $state(false);
	let composer = $state<{ submit: () => Promise<void> }>();

	function postSucceeded() {
		postedSignal.notify();
		composerHost.hideBlog();
	}

	$effect(() => {
		if (composerHost.blogOpen === wasOpen) return;
		wasOpen = composerHost.blogOpen;
		if (composerHost.blogOpen) {
			assistMode = 'affirm';
			composing = false;
			publishingPreferencesVersion += 1;
		}
	});
</script>

{#snippet mobileSubmit()}
	<Button
		variant="primary"
		class="submit-primary post-modal-mobile-submit"
		type="button"
		disabled={!submittable}
		aria-label={sending ? m.composerSubmitting() : m.composerSubmitNagi()}
		title={sending ? m.composerSubmitting() : m.composerSubmitNagi()}
		onclick={() => void composer?.submit()}
	>
		{#if sending}<Spinner inline size="sm" decorative />
		{:else}<Icon name="send" size={18} />{/if}
		<span>{sending ? m.composerSubmitting() : m.composerSubmitNagiShort()}</span>
	</Button>
{/snippet}

<PostModalShell
	mode="blog"
	modes={[]}
	title={m.blogWrite()}
	open={composerHost.blogOpen}
	{sending}
	{assistSpace}
	headerAction={mobileSubmit}
	onclose={() => composerHost.hideBlog()}
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
		mode="blog"
		{publishingPreferencesVersion}
		onsendingchange={(value) => (sending = value)}
		onposted={postSucceeded}
	/>
</PostModalShell>
<ComposerAssistant
	open={composerHost.blogOpen}
	{text}
	mode={assistMode}
	paused={sending || composing}
	bind:reservedHeight={assistSpace}
/>
