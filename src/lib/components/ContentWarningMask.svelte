<script lang="ts">
	import type { Snippet } from 'svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	let {
		revealed = $bindable(),
		kind = 'text',
		showIcon = true,
		interactive = true,
		children,
	}: {
		revealed?: boolean;
		kind?: 'text' | 'image';
		showIcon?: boolean;
		interactive?: boolean;
		children: Snippet;
	} = $props();

	function toggle(event: MouseEvent | KeyboardEvent) {
		if (!interactive) return;
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
<span
	class="cw-mask"
	class:text={kind === 'text'}
	class:image={kind === 'image'}
	class:revealed={Boolean(revealed)}
	class:static={!interactive}
	class:continuation={kind === 'text' && !showIcon}
	role={interactive ? 'button' : undefined}
	tabindex={interactive ? 0 : undefined}
	aria-expanded={interactive ? Boolean(revealed) : undefined}
	aria-label={interactive
		? revealed
			? m.contentWarningHide()
			: m.contentWarningShow()
		: undefined}
	onclick={toggle}
	onkeydown={toggle}
>
	<span class="cw-content" aria-hidden={!revealed}>{@render children()}</span>
	{#if !revealed && showIcon}
		<span
			class="cw-icon"
			class:ja={i18n.locale === 'ja'}
			class:en={i18n.locale !== 'ja'}
			aria-hidden="true"
		></span>
	{/if}
</span>

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
	.cw-mask.text:not(.revealed) {
		display: block;
		width: 100%;
		height: 5rem;
		margin: 0.5rem 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--accent-soft) 72%, var(--bg-inset));
	}
	.cw-mask.text:not(.revealed).continuation {
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
	.cw-mask.image > .cw-content {
		display: block;
		width: 100%;
		height: 100%;
	}
	.cw-content {
		transition:
			filter 140ms ease,
			opacity 140ms ease;
	}
	.cw-mask.text:not(.revealed) .cw-content {
		filter: blur(7px);
		opacity: 0.38;
		user-select: none;
		pointer-events: none;
	}
	.cw-mask.image:not(.revealed) .cw-content {
		filter: blur(24px);
		opacity: 0.18;
		user-select: none;
		pointer-events: none;
	}
	.cw-icon {
		position: absolute;
		z-index: 1;
		inset: 50% auto auto 50%;
		display: block;
		width: min(5rem, 72%);
		aspect-ratio: 1;
		max-height: 88%;
		background: var(--accent-strong);
		-webkit-mask-position: center;
		mask-position: center;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-size: contain;
		mask-size: contain;
		transform: translate(-50%, -50%);
		filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--bg) 75%, transparent));
		pointer-events: none;
	}
	.cw-icon.ja {
		-webkit-mask-image: url('/bot_blur_icon_jp.png');
		mask-image: url('/bot_blur_icon_jp.png');
	}
	.cw-icon.en {
		-webkit-mask-image: url('/bot_blur_icon_en.png');
		mask-image: url('/bot_blur_icon_en.png');
	}
	.cw-mask.text:not(.revealed) .cw-icon {
		width: min(4.5rem, 28%);
		max-height: 86%;
	}
	.cw-mask.image:not(.revealed) .cw-icon {
		width: auto;
		height: min(15rem, 82%);
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
