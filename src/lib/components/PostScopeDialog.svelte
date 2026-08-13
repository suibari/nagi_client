<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { POST_SCOPES, type ExternalTarget, type PostScope } from '$lib/post/scope';
	import Icon from './shell/Icon.svelte';

	let {
		scope,
		externalTarget,
		externalEligible,
		externalDisabledReason,
		channelName,
		onselect,
		onclose,
	}: {
		scope: PostScope;
		externalTarget: ExternalTarget;
		externalEligible: boolean;
		externalDisabledReason: string;
		channelName?: string;
		onselect: (scope: PostScope) => void;
		onclose: () => void;
	} = $props();

	let dialog = $state<HTMLDivElement>();

	const disabledFor = (value: PostScope) => value === 'external' && !externalEligible;

	const labelFor = (value: PostScope) =>
		value === 'kossori'
			? m.postScopeKossori()
			: value === 'feed'
				? (channelName ?? m.postScopeFeed())
				: externalTarget === 'bluesky'
					? m.postScopeBluesky()
					: m.postScopeStandardSite();

	const detailFor = (value: PostScope) =>
		value === 'kossori'
			? m.postScopeKossoriDetail()
			: value === 'feed'
				? channelName
					? m.postScopeChannelDetail({ channel: channelName })
					: m.postScopeFeedDetail()
				: externalTarget === 'bluesky'
					? m.postScopeBlueskyDetail()
					: m.postScopeStandardSiteDetail();

	const iconFor = (value: PostScope) =>
		value === 'kossori'
			? 'hide'
			: value === 'feed'
				? channelName
					? 'hash'
					: 'home'
				: externalTarget === 'bluesky'
					? 'bluesky'
					: 'newspaper';

	function select(value: PostScope) {
		if (disabledFor(value)) return;
		onselect(value);
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
			return;
		}
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		// ゲージなので左右キーで段階を動かせるようにする。無効な段はまたがずに止める。
		event.preventDefault();
		const step = event.key === 'ArrowRight' ? 1 : -1;
		const next = POST_SCOPES[POST_SCOPES.indexOf(scope) + step];
		if (next) select(next);
	}

	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onclose();
	}

	onMount(() => dialog?.focus());
</script>

<svelte:window onkeydown={keydown} />
<div class="scope-backdrop" role="presentation" onclick={backdropClick}>
	<div
		bind:this={dialog}
		class="scope-dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="post-scope-title"
		tabindex="-1"
	>
		<header>
			<h2 id="post-scope-title">{m.postScopeTitle()}</h2>
			<button
				class="icon-action"
				type="button"
				aria-label={m.close()}
				title={m.close()}
				onclick={onclose}><Icon name="close" size={18} /></button
			>
		</header>

		<div class="gauge" role="radiogroup" aria-labelledby="post-scope-title">
			<div class="gauge-track" aria-hidden="true">
				<span
					class="gauge-fill"
					style={`width: ${(POST_SCOPES.indexOf(scope) / (POST_SCOPES.length - 1)) * 100}%`}
				></span>
			</div>
			{#each POST_SCOPES as value (value)}
				<button
					class="gauge-step"
					class:selected={scope === value}
					class:reached={POST_SCOPES.indexOf(value) <= POST_SCOPES.indexOf(scope)}
					type="button"
					role="radio"
					aria-checked={scope === value}
					disabled={disabledFor(value)}
					title={disabledFor(value) ? externalDisabledReason : labelFor(value)}
					onclick={() => select(value)}
				>
					<span class="gauge-dot"><Icon name={iconFor(value)} size={15} /></span>
					<span class="gauge-label">{labelFor(value)}</span>
				</button>
			{/each}
		</div>

		<p class="scope-detail">{detailFor(scope)}</p>
		{#if !externalEligible && externalDisabledReason}
			<p class="scope-note">{externalDisabledReason}</p>
		{/if}

		<div class="scope-actions">
			<button type="button" class="primary" onclick={onclose}>{m.postScopeDone()}</button>
		</div>
	</div>
</div>

<style>
	.scope-backdrop {
		position: fixed;
		inset: 0;
		z-index: 120;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: color-mix(in srgb, var(--bg) 82%, #000);
	}

	.scope-dialog {
		display: flex;
		flex-direction: column;
		gap: 14px;
		width: min(100%, 460px);
		padding: 18px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-md);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
	}

	.scope-dialog:focus {
		outline: none;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--line);
	}

	h2 {
		margin: 0;
		font-size: 0.95rem;
	}

	.gauge {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
		padding-top: 4px;
	}

	/* ドットの中心（各列の中央）どうしを結ぶ線。両端の余白は 1/6 ずつ。 */
	.gauge-track {
		position: absolute;
		top: 20px;
		right: 16.67%;
		left: 16.67%;
		height: 3px;
		border-radius: var(--radius-pill);
		background: var(--line);
	}

	.gauge-fill {
		display: block;
		height: 100%;
		border-radius: var(--radius-pill);
		background: var(--accent);
		transition: width 0.18s ease;
	}

	.gauge-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--text-muted);
		font-size: 0.72rem;
		font-weight: 700;
		line-height: 1.3;
		text-align: center;
	}

	.gauge-step:disabled {
		opacity: 0.4;
	}

	.gauge-dot {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border: 2px solid var(--line-strong);
		border-radius: 50%;
		background: var(--bg-raised);
		color: var(--text-faint);
		transition:
			border-color 0.18s ease,
			color 0.18s ease;
	}

	.gauge-step.reached:not(:disabled) .gauge-dot {
		border-color: var(--accent);
		color: var(--accent-strong);
	}

	.gauge-step.selected .gauge-dot {
		background: var(--accent-soft);
	}

	.gauge-step.selected .gauge-label {
		color: var(--text);
	}

	.gauge-label {
		display: block;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.scope-detail {
		margin: 0;
		padding: 10px 12px;
		border-radius: var(--r-md);
		background: var(--surface-2);
		color: var(--text-muted);
		font-size: 0.8rem;
		line-height: 1.6;
	}

	.scope-note {
		margin: 0;
		color: var(--text-faint);
		font-size: 0.74rem;
	}

	.scope-actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
