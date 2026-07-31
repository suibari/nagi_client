<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import Composer from './Composer.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * ポストモーダル。
	 *
	 * Composer は開いていない間も破棄しない。{#if} で作り直すと ImageAttachmentEditor が
	 * アンマウント時に Object URL を解放してしまい、閉じて開き直しただけで添付画像の
	 * プレビューと書きかけが失われる（ComposerEditor のプレビュー切替が hidden なのも同じ理由）。
	 * 開閉は表示の切り替えだけで行う。
	 */
	let mode = $state<'simple' | 'rich'>('simple');
	let dialog = $state<HTMLDivElement>();
	let wasOpen = $state(false);

	// 開くたびに「あっさり」へ戻す。日常の投稿は短文が圧倒的に多く、
	// 毎回同じ場所に同じものが出る予測可能性を優先する。
	$effect(() => {
		if (composerHost.open === wasOpen) return;
		wasOpen = composerHost.open;
		if (composerHost.open) {
			mode = 'simple';
			// hidden が外れてから当てないとフォーカスが乗らない。
			requestAnimationFrame(() => dialog?.focus());
		}
	});

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && composerHost.open) {
			event.preventDefault();
			composerHost.hide();
		}
	}

	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) composerHost.hide();
	}
</script>

<svelte:window onkeydown={keydown} />
<div
	class="post-modal-backdrop"
	role="presentation"
	hidden={!composerHost.open}
	onclick={backdropClick}
>
	<div
		bind:this={dialog}
		class="post-modal"
		class:rich={mode === 'rich'}
		role="dialog"
		aria-modal="true"
		aria-labelledby="post-modal-title"
		tabindex="-1"
	>
		<header>
			<h2 id="post-modal-title" class="visually-hidden">{m.postModalTitle()}</h2>
			<div class="post-modal-modes" role="tablist" aria-label={m.postModalModesAria()}>
				<button
					type="button"
					role="tab"
					aria-selected={mode === 'simple'}
					class:active={mode === 'simple'}
					onclick={() => (mode = 'simple')}>{m.postModeSimple()}</button
				>
				<button
					type="button"
					role="tab"
					aria-selected={mode === 'rich'}
					class:active={mode === 'rich'}
					onclick={() => (mode = 'rich')}>{m.postModeRich()}</button
				>
			</div>
			<button
				class="icon-action post-modal-close"
				type="button"
				aria-label={m.close()}
				title={m.close()}
				onclick={() => composerHost.hide()}><Icon name="close" size={18} /></button
			>
		</header>
		<div class="post-modal-body">
			<Composer
				{mode}
				channel={composerHost.channel}
				defaultScope={composerHost.defaultScope}
				onstarted={() => composerHost.hide()}
				onposted={() => postedSignal.notify()}
			/>
		</div>
	</div>
</div>

<style>
	.post-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 110;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 40px 16px 16px;
		overflow-y: auto;
		background: rgb(0 0 0 / 0.4);
	}

	.post-modal-backdrop[hidden] {
		display: none;
	}

	.post-modal {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: min(100%, 620px);
		padding: 8px 12px 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-card);
	}

	/*
		「しっかり」のときだけ、長文を書ける高さを最初から確保する。本文の量に応じて
		伸びる作りにすると、書けば書くほど送信ボタンが画面外へ逃げてしまうため、
		パネル高さを固定して本文だけを内側でスクロールさせる。
	*/
	.post-modal.rich {
		height: min(760px, calc(100dvh - 72px));
		overflow: hidden;
	}

	.post-modal:focus {
		outline: none;
	}

	.post-modal-body {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.post-modal.rich .post-modal-body {
		flex: 1;
	}

	/* 閉じる・モード切替・（本文の下の）投稿範囲と送信で上下を締める。
	   ヘッダー自体は高さを持たせず、本文までの距離を詰める。 */
	header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.post-modal-modes {
		display: flex;
		gap: 2px;
	}

	.post-modal-close {
		margin-inline-start: auto;
	}

	.post-modal-modes button {
		padding: 4px 12px;
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--text-muted);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}

	.post-modal-modes button.active {
		background: var(--accent-soft);
		color: var(--accent-strong);
	}

	@media (max-width: 767px) {
		.post-modal-backdrop {
			padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
		}

		.post-modal {
			padding: 6px 10px 10px;
		}

		/* スマホは画面をほぼ使い切る（バックドロップの余白ぶんだけ引く）。 */
		.post-modal.rich {
			height: calc(100dvh - 16px - env(safe-area-inset-bottom));
		}
	}
</style>
