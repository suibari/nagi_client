<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { COMPOSER_MODES, type ComposerMode } from '$lib/post/composer-mode';
	import Icon from './shell/Icon.svelte';

	let {
		open,
		mode = $bindable<ComposerMode>('simple'),
		modes = COMPOSER_MODES,
		sending = false,
		assistSpace = 0,
		title = m.postModalTitle(),
		onclose,
		onmodechange,
		headerAction,
		children,
	}: {
		open: boolean;
		mode?: ComposerMode;
		/**
		 * 出すタブ。ゲスト投稿や返信のようにブログにできない文脈では絞る。
		 * 選択中のモードがここから外れたら、呼び出し元が mode を戻す。
		 */
		modes?: ComposerMode[];
		sending?: boolean;
		/** ポストおたすけ欄の高さ。モーダルと重ならないよう表示領域から差し引く。 */
		assistSpace?: number;
		title?: string;
		onclose: () => void;
		onmodechange?: (mode: ComposerMode) => void;
		headerAction?: Snippet;
		children: Snippet;
	} = $props();
	let dialog = $state<HTMLDivElement>();
	const modeLabel = (value: ComposerMode) =>
		value === 'simple'
			? m.postModeSimple()
			: value === 'rich'
				? m.postModeRich()
				: m.postModeBlog();

	let viewportTop = $state(0);
	let viewportBottom = $state(0);

	$effect(() => {
		if (open) requestAnimationFrame(() => dialog?.focus());
	});

	/*
		モバイルのソフトウェアキーボードは画面に重なるだけで、100dvh も fixed の inset:0 も
		縮まない（Android Chrome の既定）。そのままだとモーダルの下半分がキーボードの裏に入り、
		ブラウザがカーソルを見せようと画面ごと持ち上げてタブまで上へ逃げる。
		実際に見えている領域（visualViewport）に背景を合わせ、モーダルをその中へ収める。
	*/
	$effect(() => {
		const viewport = window.visualViewport;
		if (!open || !viewport) {
			viewportTop = 0;
			viewportBottom = 0;
			return;
		}
		const update = () => {
			viewportTop = Math.max(0, viewport.offsetTop);
			viewportBottom = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
		};
		update();
		viewport.addEventListener('resize', update);
		viewport.addEventListener('scroll', update);
		return () => {
			viewport.removeEventListener('resize', update);
			viewport.removeEventListener('scroll', update);
		};
	});

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && !sending) {
			event.preventDefault();
			onclose();
		}
	}

	function selectMode(nextMode: ComposerMode) {
		mode = nextMode;
		onmodechange?.(nextMode);
	}
</script>

<svelte:window onkeydown={keydown} />
<div
	class="post-modal-backdrop"
	role="presentation"
	hidden={!open}
	style:--post-modal-assist-space={`${assistSpace}px`}
	style:top={`${viewportTop}px`}
	style:bottom={`${viewportBottom}px`}
	onclick={(event) => event.target === event.currentTarget && !sending && onclose()}
>
	<div
		bind:this={dialog}
		class="post-modal"
		class:rich={mode !== 'simple'}
		class:blog={mode === 'blog'}
		class:has-header-action={headerAction}
		role="dialog"
		aria-modal="true"
		aria-labelledby="post-modal-title"
		tabindex="-1"
	>
		<header>
			<h2 id="post-modal-title" class="visually-hidden">{title}</h2>
			<div class="post-modal-modes" role="tablist" aria-label={m.postModalModesAria()}>
				{#each modes as value (value)}
					<button
						type="button"
						role="tab"
						aria-selected={mode === value}
						class:active={mode === value}
						disabled={sending}
						onclick={() => selectMode(value)}>{modeLabel(value)}</button
					>
				{/each}
			</div>
			{#if headerAction}
				<div class="post-modal-header-action">{@render headerAction()}</div>
			{/if}
			<button
				class="icon-action post-modal-close"
				type="button"
				disabled={sending}
				aria-label={m.close()}
				title={m.close()}
				onclick={onclose}><Icon name="close" size={18} /></button
			>
		</header>
		<div class="post-modal-body">{@render children()}</div>
	</div>
</div>

<style>
	.post-modal-backdrop {
		position: fixed;
		/* top と bottom は見えている領域に合わせて差し込む。 */
		inset: 0;
		z-index: 110;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 40px 16px calc(16px + var(--post-modal-assist-space, 0px));
		overflow-y: auto;
		background: color-mix(in srgb, var(--bg) 82%, #000);
	}
	.post-modal-backdrop[hidden] {
		display: none;
	}
	.post-modal {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: min(100%, 620px);
		/* 背景の内側（見えている領域から余白とおたすけ欄を除いた分）に収め、本文を内側でスクロールさせる。 */
		max-height: 100%;
		padding: 12px 16px 16px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-md);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
	}
	.post-modal.rich {
		height: min(760px, 100%);
		overflow: hidden;
	}
	.post-modal:focus {
		outline: none;
	}
	header {
		flex-shrink: 0;
	}
	.post-modal-body {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.post-modal.rich .post-modal-body {
		flex: 1;
	}
	header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--line);
	}
	.post-modal-modes {
		display: flex;
		gap: 4px;
		/* タブが3つになったので、狭い画面では閉じる/送信より先に縮む側にする。 */
		min-width: 0;
		flex-shrink: 1;
	}
	.post-modal-close {
		margin-inline-start: auto;
	}
	.post-modal-header-action {
		display: none;
	}
	.post-modal-modes button {
		min-height: 28px;
		padding: 4px 10px;
		white-space: nowrap;
		border: 1px solid transparent;
		border-radius: var(--r-sm);
		background: transparent;
		color: var(--text-sub);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	.post-modal-modes button.active {
		border-color: var(--line-strong);
		background: var(--surface-2);
		color: var(--text);
	}
	@media (min-width: 1024px) {
		/* ブログは本文の右に記事メタ欄が並ぶぶんだけ広い。しっかりは本文 1 列なので通常幅のまま。 */
		.post-modal.blog {
			width: min(calc(100vw - 32px), 1120px);
		}
	}
	@media (max-width: 767px) {
		.post-modal-backdrop {
			padding: 8px 8px calc(8px + env(safe-area-inset-bottom) + var(--post-modal-assist-space, 0px));
		}
		.post-modal {
			padding: 10px 12px 12px;
		}
		.post-modal-header-action {
			display: block;
			margin-inline-start: auto;
		}
		.post-modal.has-header-action .post-modal-close {
			order: -1;
			margin-inline-start: 0;
		}
		.post-modal-header-action :global(.post-modal-mobile-submit) {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 5px;
			height: 38px;
			padding: 0 12px;
			border-radius: var(--r-md);
			font-size: 14px;
			font-weight: 700;
			white-space: nowrap;
		}
		.post-modal.has-header-action :global(.composer-foot .submit-primary) {
			display: none;
		}
		.post-modal.rich {
			height: 100%;
		}
		.post-modal-modes button {
			padding: 4px 8px;
		}
	}
</style>
