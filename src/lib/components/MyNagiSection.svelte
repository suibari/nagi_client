<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * my Nagi の各セクションの外枠。見出し・「もっと見る」・読み込み中／失敗／空の
	 * 出し分けをここに集約し、中身のコンポーネントは並べることだけに集中させる。
	 * セクションは互いに独立して読み込むので、1本失敗しても画面全体は生きている。
	 */
	let {
		title,
		icon,
		description,
		moreHref,
		loading = false,
		error = '',
		empty = false,
		unread = false,
		unreadLabel = '',
		onretry,
		emptyState,
		headerActions,
		children,
	}: {
		title: string;
		icon: string;
		/** 内容があるとき、見出しと本文の間に表示する短い案内文。 */
		description?: string;
		moreHref?: string;
		loading?: boolean;
		error?: string;
		empty?: boolean;
		/** 見出しに未読ドットを出す。ナビから外した導線の代わり。 */
		unread?: boolean;
		unreadLabel?: string;
		onretry?: () => void;
		/** 空のときに出す導線。省略すると既定の文言だけ出る。 */
		emptyState?: Snippet;
		/** 「もっと見る」と並べる、カルーセル操作などの見出し右側アクション。 */
		headerActions?: Snippet;
		children: Snippet;
	} = $props();
</script>

<section class="my-nagi-section">
	<header>
		<span class="my-nagi-section-mark"><Icon name={icon} size={17} /></span>
		<h2>{title}</h2>
		{#if unread}<span class="my-nagi-unread" role="status" aria-label={unreadLabel}></span>{/if}
		{#if (moreHref && !empty && !error) || headerActions}
			<div class="my-nagi-section-actions" class:with-header-actions={Boolean(headerActions)}>
				{#if moreHref && !empty && !error}
					<a class="my-nagi-more" href={moreHref}
						>{m.myNagiMore()}<Icon name="chevron" size={15} /></a
					>
				{/if}
				{#if headerActions}{@render headerActions()}{/if}
			</div>
		{/if}
	</header>
	<div class="my-nagi-section-body">
		{#if loading}
			<p class="my-nagi-state" role="status">{m.loading()}</p>
		{:else if error}
			<p class="my-nagi-state my-nagi-state-error">
				<span>{error}</span>
				{#if onretry}<button type="button" onclick={onretry}>{m.retry()}</button>{/if}
			</p>
		{:else if empty}
			{#if emptyState}{@render emptyState()}{:else}
				<p class="my-nagi-state">{m.myNagiEmpty()}</p>
			{/if}
		{:else}
			{#if description}<p class="my-nagi-section-intro">{description}</p>{/if}
			{@render children()}
		{/if}
	</div>
</section>

<style>
	.my-nagi-section {
		inline-size: 100%;
		min-inline-size: 0;
		max-inline-size: 100%;
		margin-bottom: 32px;
		border: 0;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
	}

	header {
		display: flex;
		align-items: center;
		min-inline-size: 0;
		max-inline-size: 100%;
		gap: 8px;
		min-height: 37px;
		padding: 0 0 10px;
		border-bottom: 1px solid var(--line);
	}

	.my-nagi-section-mark {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		width: 16px;
		height: 16px;
		color: var(--text-mute);
	}

	h2 {
		min-inline-size: 0;
		margin: 0;
		color: var(--text-strong);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 1.4;
	}

	/* ナビのドット（.nav-unread-dot）と同じ色・大きさに揃える。 */
	.my-nagi-unread {
		flex: 0 0 auto;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--decorative-accent);
	}

	.my-nagi-section-actions {
		display: flex;
		align-items: center;
		min-inline-size: 0;
		max-inline-size: 100%;
		gap: 6px;
		margin-inline-start: auto;
	}

	.my-nagi-more {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		color: var(--text-muted);
		font-size: 12px;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	.my-nagi-more:hover {
		color: var(--accent-strong);
	}

	@media (max-width: 420px) {
		.my-nagi-section-actions.with-header-actions {
			gap: 2px;
		}

		.my-nagi-section-actions.with-header-actions .my-nagi-more {
			gap: 0;
			font-size: 0;
		}
	}

	.my-nagi-section-body {
		inline-size: 100%;
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: 8px 0 0;
	}

	.my-nagi-section-intro {
		margin: 0;
		padding: 4px 0 0;
		color: var(--text-muted);
		font-size: 12px;
		line-height: 1.55;
	}

	.my-nagi-state {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		padding: 12px 4px;
		color: var(--text-muted);
		font-size: 12px;
		line-height: 1.55;
	}

	.my-nagi-state-error {
		color: var(--danger);
	}

	.my-nagi-state button {
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--accent-strong);
		font: inherit;
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 2px;
		cursor: pointer;
	}
</style>
