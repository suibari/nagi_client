<script lang="ts">
	/**
	 * 設定の1行。左に項目名と説明、右に操作（トグル・切り替え・セレクトなど）を置く。
	 * 配色の見本のように幅が要る中身は children に渡すと、項目名の下に全幅で並ぶ。
	 * control には項目名と説明の id を渡すので、操作の aria-labelledby / aria-describedby に使う。
	 */
	import type { Snippet } from 'svelte';

	let {
		label,
		description,
		control,
		children,
	}: {
		label?: string;
		description?: string;
		control?: Snippet<[{ labelId: string; descriptionId: string | undefined }]>;
		children?: Snippet;
	} = $props();

	const uid = $props.id();
	const labelId = `${uid}-label`;
	const descriptionId = $derived(description ? `${uid}-description` : undefined);
</script>

<div class="setting-row" class:has-control={!!control}>
	{#if label || description}
		<div class="setting-row-text">
			{#if label}<span class="setting-row-label" id={labelId}>{label}</span>{/if}
			{#if description}<span class="setting-row-description" id={descriptionId}>{description}</span
				>{/if}
		</div>
	{/if}
	{#if control}<div class="setting-row-control">
			{@render control({ labelId, descriptionId })}
		</div>{/if}
	{#if children}<div class="setting-row-body">{@render children()}</div>{/if}
</div>
