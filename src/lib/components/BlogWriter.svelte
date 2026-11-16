<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import type { BlogEditTarget } from '$lib/blog/edit-target';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import Composer from './Composer.svelte';
	import ComposerAssistant from './ComposerAssistant.svelte';
	import Icon from './shell/Icon.svelte';

	/** ブログの執筆ページ（BLOG-07）。新規作成と編集で同じものを使う。 */
	let { editTarget }: { editTarget?: BlogEditTarget } = $props();

	let text = $state('');
	let sending = $state(false);
	let submittable = $state(false);
	let dirty = $state(false);
	let assistMode = $state<'affirm' | 'question'>('affirm');
	let composing = $state(false);
	let assistSpace = $state(0);
	let wide = $state(false);
	let composer = $state<{ submit: () => Promise<void> }>();

	const articleHref = (uri: string) => {
		const [, , did, , rkey] = uri.split('/');
		return `/blog/${did}/${rkey}`;
	};
	const back = $derived(
		editTarget
			? { href: articleHref(editTarget.uri), label: m.blogBackToArticle() }
			: { href: '/blog', label: m.blogBackToList() },
	);

	// おたすけは広い画面では右カラムに置き、狭い画面では下に重ねる（POST-08）。
	$effect(() => {
		const media = window.matchMedia('(min-width: 1024px)');
		const update = () => (wide = media.matches);
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	});

	beforeNavigate((navigation) => {
		if (!dirty) return;
		// タブを閉じる・リロードは、cancel するとブラウザ自身の確認が出る。
		if (navigation.willUnload) {
			navigation.cancel();
			return;
		}
		if (!confirm(m.blogLeaveConfirm())) navigation.cancel();
	});

	async function posted(uri: string) {
		postedSignal.notify();
		await goto(articleHref(uri));
	}
</script>

<div class="blog-write" style:--blog-write-assist-space={`${assistSpace}px`}>
	<PageHeader title={editTarget ? m.blogEdit() : m.blogWrite()} {back}>
		{#snippet actions()}
			<Button
				variant="primary"
				class="blog-write-submit"
				type="button"
				disabled={!submittable}
				aria-label={sending
					? m.composerSubmitting()
					: editTarget
						? m.save()
						: m.composerSubmitNagi()}
				onclick={() => void composer?.submit()}
			>
				{#if sending}<Spinner inline size="sm" decorative />
				{:else}<Icon name="send" size={18} />{/if}
				<span
					>{sending
						? m.composerSubmitting()
						: editTarget
							? m.save()
							: m.composerSubmitNagiShort()}</span
				>
			</Button>
		{/snippet}
	</PageHeader>
	{#if $session}
		<Composer
			bind:this={composer}
			bind:text
			bind:submittable
			bind:dirty
			mode="blog"
			{editTarget}
			ontextinput={(event) => {
				// 変換中の削除・置換は、実際の本文削除として扱わない。
				if (composing || event.isComposing) return;
				assistMode = event.inputType?.startsWith('delete') ? 'question' : 'affirm';
			}}
			oncompositionchange={(value) => {
				composing = value;
				if (!value) assistMode = 'affirm';
			}}
			onsendingchange={(value) => (sending = value)}
			onposted={posted}
		>
			{#snippet aside()}
				<ComposerAssistant
					open
					{text}
					mode={assistMode}
					paused={sending || composing}
					placement={wide ? 'inline' : 'floating'}
					bind:reservedHeight={assistSpace}
				/>
			{/snippet}
		</Composer>
	{/if}
</div>

<style>
	.blog-write {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	/* 送信ボタンは本文の下にもある。見出しの横のものは狭い画面だけに出す。 */
	.blog-write :global(.blog-write-submit) {
		display: none;
		white-space: nowrap;
	}
	@media (min-width: 768px) {
		/* 広いシェルは右端に 12px しか残らないので、左サイドバーとの間（32px）に揃える。 */
		.blog-write {
			padding-inline-end: 20px;
		}
	}
	/*
		本文の右に記事メタ欄が並ぶ幅だけ、本文欄を画面の高さいっぱいに取って内側でスクロールさせる。
		それより狭いとメタ欄が本文の下に積まれ、高さを固定すると本文欄が潰れて内側スクロールになる。
	*/
	@media (min-width: 1024px) {
		.blog-write {
			height: calc(100dvh - 40px);
		}
		.blog-write :global(.composer) {
			flex: 1;
			min-height: 0;
		}
		/* シェルの下余白（フィードの投稿ボタン用）のぶん、画面からはみ出さないようにする。 */
		:global(.shell > main:has(> .blog-write)) {
			padding-bottom: 24px;
		}
	}
	@media (max-width: 1023px) {
		.blog-write {
			/* 下に重ねたおたすけの高さぶん、本文の末尾までスクロールできるようにする。 */
			padding-bottom: var(--blog-write-assist-space, 0px);
		}
		.blog-write :global(.composer.rich .mention-textarea .composer-input) {
			min-height: 50dvh;
		}
	}
	@media (max-width: 767px) {
		.blog-write :global(.blog-write-submit) {
			display: inline-flex;
		}
	}
</style>
