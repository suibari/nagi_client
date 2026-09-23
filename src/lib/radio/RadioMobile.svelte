<script lang="ts">
	import { radio } from './radio.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import RadioContent from './RadioContent.svelte';
	import { tick } from 'svelte';
	let dialog = $state<HTMLDialogElement>();
	async function show() {
		if (!radio.track) return;
		radio.show();
		await tick();
		dialog?.showModal();
	}
	function hide() {
		radio.hide();
	}
</script>

{#if radio.track && !radio.open}
	<button class="radio-fab" type="button" aria-label={m.radioOpen()} onclick={show}>
		<img src="/bot_dj_laugh.webp" alt="" width="48" height="48" />
		{#if radio.isNew}<span aria-hidden="true">♪</span>{/if}
	</button>
{/if}
{#if radio.open && radio.track}
	<dialog bind:this={dialog} onclose={hide} aria-label={m.radioTitle()}>
		<div class="radio-bubble-body">
			<button class="radio-close" type="button" aria-label={m.close()} onclick={() => dialog?.close()}
				>×</button
			>
			<RadioContent track={radio.track} bubble />
		</div>
	</dialog>
{/if}

<style>
	.radio-fab {
		display: none;
	}
	dialog {
		position: fixed;
		inset: auto 18px 84px auto;
		margin: 0;
		width: min(440px, calc(100vw - 36px));
		max-height: min(75dvh, 720px);
		overflow: visible;
		border: 1px solid #6dd9c0;
		border-radius: 18px;
		padding: 14px;
		background: var(--bg);
		color: var(--text);
		box-shadow: 0 16px 60px #0005;
		transform-origin: bottom right;
		animation: radio-pop 280ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
	}
	.radio-bubble-body {
		max-height: calc(75dvh - 32px);
		overflow: auto;
	}
	dialog::backdrop {
		background: #0006;
	}
	dialog::after {
		content: '';
		position: absolute;
		bottom: -9px;
		right: 18px;
		width: 14px;
		height: 14px;
		background: var(--bg);
		border-right: 1px solid #6dd9c0;
		border-bottom: 1px solid #6dd9c0;
		transform: rotate(45deg);
	}
	@keyframes radio-pop {
		from {
			opacity: 0;
			transform: scale(0.15);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.radio-close {
		display: block;
		margin-left: auto;
		margin-bottom: 4px;
		width: 32px;
		height: 32px;
		border: 0;
		border-radius: 50%;
		background: var(--bg-inset);
		color: var(--text);
		font-size: 24px;
		cursor: pointer;
	}
	@media (max-width: 1179px) {
		.radio-fab {
			display: grid;
			place-items: center;
			position: fixed;
			right: 18px;
			bottom: 18px;
			z-index: 30;
			width: 58px;
			height: 58px;
			padding: 0;
			border: 0;
			background: transparent;
			cursor: pointer;
		}
		.radio-fab img {
			width: 48px;
			height: 48px;
			object-fit: contain;
		}
		.radio-fab span {
			position: absolute;
			top: -5px;
			right: -4px;
			border-radius: 50%;
			background: var(--accent-strong);
			color: white;
			width: 21px;
			height: 21px;
			font-size: 14px;
		}
	}
	@media (max-width: 767px) {
		.radio-fab {
			left: 18px;
			right: auto;
		}
		dialog {
			left: 18px;
			right: auto;
			transform-origin: bottom left;
		}
		dialog::after {
			left: 18px;
			right: auto;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		dialog {
			animation: none;
		}
	}
</style>
