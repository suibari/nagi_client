<script lang="ts">
	let {
		checked,
		label,
		labelledby,
		describedby,
		disabled = false,
		onchange,
	}: {
		checked: boolean;
		/** 見える項目名。設定の行（SettingRow）では行の項目名を labelledby で指して省く。 */
		label?: string;
		labelledby?: string;
		describedby?: string;
		disabled?: boolean;
		onchange: (checked: boolean) => void;
	} = $props();
</script>

<button
	class="toggle-switch"
	type="button"
	role="switch"
	aria-checked={checked}
	aria-labelledby={labelledby}
	aria-describedby={describedby}
	class:bare={!label}
	{disabled}
	onclick={() => onchange(!checked)}
>
	{#if label}<span class="label">{label}</span>{/if}
	<span class="track" aria-hidden="true"><span class="thumb"></span></span>
</button>

<style>
	/* 設定行の慣習に合わせ、ラベルを左・スイッチを右端に置く。 */
	.toggle-switch {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		inline-size: 100%;
		min-height: 2.75rem;
		padding: 0.25rem 0;
		border: 0;
		background: none;
		color: var(--text);
		text-align: start;
		cursor: pointer;
	}

	.toggle-switch.bare {
		inline-size: auto;
		min-height: 0;
	}

	.toggle-switch:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.track {
		flex: none;
		position: relative;
		inline-size: 2.75rem;
		block-size: 1.5rem;
		background: var(--bg-inset);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-pill);
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}

	.thumb {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-start: 0.15rem;
		inline-size: 1.1rem;
		block-size: 1.1rem;
		background: var(--bg);
		border-radius: 50%;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
		transform: translateY(-50%);
		transition: inset-inline-start 0.15s ease;
	}

	.toggle-switch[aria-checked='true'] .track {
		background: var(--accent);
		border-color: var(--accent);
	}

	.toggle-switch[aria-checked='true'] .thumb {
		inset-inline-start: calc(100% - 1.25rem);
	}

	.toggle-switch:hover:not(:disabled) .track {
		border-color: var(--accent-border);
	}

	.toggle-switch:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
		border-radius: var(--radius-s);
	}
</style>
