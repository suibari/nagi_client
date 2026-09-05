<script lang="ts">
	import type { Snippet } from 'svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	let {
		revealed = $bindable(),
		kind = 'text',
		active = true,
		title,
		showIcon = true,
		interactive = true,
		children,
	}: {
		revealed?: boolean;
		kind?: 'text' | 'image' | 'content';
		active?: boolean;
		title?: string;
		showIcon?: boolean;
		interactive?: boolean;
		children: Snippet;
	} = $props();

	let concealed = $derived(active && !revealed);
	let actionable = $derived(active && interactive);
	let element = $derived(kind === 'text' ? 'span' : 'div');

	function toggle(event: MouseEvent | KeyboardEvent) {
		if (!actionable) return;
		if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') return;
		if (
			Boolean(revealed) &&
			event.target instanceof Element &&
			event.target.closest('a, button') !== event.currentTarget
		)
			return;
		event.preventDefault();
		event.stopPropagation();
		revealed = !revealed;
	}
</script>

<!-- role/tabindex are both present only for the interactive variant. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<svelte:element
	this={element}
	class="cw-mask"
	class:text={kind === 'text'}
	class:image={kind === 'image'}
	class:content={kind === 'content'}
	class:concealed
	class:revealed={active && Boolean(revealed)}
	class:inactive={!active}
	class:static={!actionable}
	class:continuation={kind === 'text' && !showIcon}
	role={actionable ? 'button' : undefined}
	tabindex={actionable ? 0 : undefined}
	aria-expanded={actionable ? Boolean(revealed) : undefined}
	aria-label={actionable ? (revealed ? m.contentWarningHide() : m.contentWarningShow()) : undefined}
	onclick={toggle}
	onkeydown={toggle}
>
	<svelte:element this={element} class="cw-content" aria-hidden={concealed || undefined}
		>{@render children()}</svelte:element
	>
	{#if concealed && showIcon}
		<span class="cw-notice" aria-hidden="true">
			<span class="cw-heading">
				<svg class="cw-warning-icon" viewBox="0 0 24 24">
					<path
						d="M12 2 1 21h22L12 2Zm0 3.99L19.53 19H4.47L12 5.99ZM11 10v4h2v-4h-2Zm0 6v2h2v-2h-2Z"
					/>
				</svg>
				<span class="cw-title">{title ?? m.contentWarningMenuTitle()}</span>
			</span>
			<span class="cw-icon" class:ja={i18n.locale === 'ja'} class:en={i18n.locale !== 'ja'}></span>
			{#if interactive}<span class="cw-help">{m.moderationRevealHelp()}</span>{/if}
		</span>
	{/if}
</svelte:element>

<style>
	.cw-mask {
		position: relative;
		border-radius: var(--radius-s);
		cursor: pointer;
		outline: none;
	}
	.cw-mask:focus-visible {
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.cw-mask.text {
		display: inline;
	}
	.cw-mask.text.concealed {
		display: block;
		width: 100%;
		height: 8.5rem;
		margin: 0.5rem 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--accent-soft) 72%, var(--bg-inset));
	}
	.cw-mask.text.concealed.continuation {
		display: none;
	}
	.cw-mask.text.revealed {
		padding: 0;
		background: none;
	}
	.cw-mask.image {
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.cw-mask.content {
		display: block;
		min-width: 0;
		overflow: hidden;
	}
	.cw-mask.content.concealed {
		min-height: 10rem;
		background: color-mix(in srgb, var(--accent-soft) 72%, var(--bg-inset));
	}
	.cw-mask.image > .cw-content {
		display: block;
		width: 100%;
		height: 100%;
	}
	.cw-mask.content > .cw-content {
		display: block;
	}
	.cw-content {
		transition:
			filter 140ms ease,
			opacity 140ms ease;
	}
	.cw-mask.text.concealed .cw-content {
		filter: blur(7px);
		opacity: 0.38;
		user-select: none;
		pointer-events: none;
	}
	.cw-mask.image.concealed .cw-content,
	.cw-mask.content.concealed .cw-content {
		filter: blur(24px);
		opacity: 0.18;
		user-select: none;
		pointer-events: none;
	}
	.cw-mask.content.concealed .cw-content {
		transform: scale(1.03);
	}
	.cw-notice {
		position: absolute;
		z-index: 1;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.75rem;
		text-align: center;
		color: var(--text);
		pointer-events: none;
	}
	.cw-heading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
	}
	.cw-warning-icon {
		flex: 0 0 auto;
		width: 1.1rem;
		height: 1.1rem;
		fill: currentColor;
		color: var(--warning);
	}
	.cw-title {
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1.3;
	}
	.cw-help {
		font-size: 0.75rem;
		line-height: 1.3;
		color: var(--text-muted);
	}
	.cw-icon {
		display: block;
		width: min(4.25rem, 72%);
		aspect-ratio: 1;
		max-height: 62%;
		background: var(--content-warning-icon-color, var(--accent-strong));
		-webkit-mask-position: center;
		mask-position: center;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-size: contain;
		mask-size: contain;
		filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--bg) 75%, transparent));
	}
	.cw-icon.ja {
		-webkit-mask-image: url('/bot_blur_icon_jp.png');
		mask-image: url('/bot_blur_icon_jp.png');
	}
	.cw-icon.en {
		-webkit-mask-image: url('/bot_blur_icon_en.png');
		mask-image: url('/bot_blur_icon_en.png');
	}
	.cw-mask.text.concealed .cw-icon {
		width: min(3.5rem, 24%);
	}
	.cw-mask.image.concealed .cw-icon,
	.cw-mask.content.concealed .cw-icon {
		width: auto;
		height: min(6.5rem, 55%);
		aspect-ratio: 401 / 622;
		max-height: none;
	}
	.cw-mask.static {
		cursor: default;
	}
	@media (prefers-reduced-motion: reduce) {
		.cw-content {
			transition: none;
		}
	}
</style>
