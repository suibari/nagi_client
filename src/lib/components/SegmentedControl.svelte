<script lang="ts" generics="T extends string">
	/**
	 * 少数の選択肢から1つを選ぶ切り替え（例: システム設定 / ライト / ダーク）。
	 * 中身はラジオボタンなので、矢印キーでの移動と読み上げはブラウザに任せる。
	 */
	let {
		options,
		value,
		onchange,
		labelledby,
		describedby,
	}: {
		options: { value: T; label: string }[];
		value: T;
		onchange: (value: T) => void;
		labelledby?: string;
		describedby?: string;
	} = $props();

	const name = $props.id();
</script>

<div
	class="segmented"
	role="radiogroup"
	aria-labelledby={labelledby}
	aria-describedby={describedby}
>
	{#each options as option (option.value)}
		<label class:checked={value === option.value}>
			<input
				type="radio"
				{name}
				value={option.value}
				checked={value === option.value}
				onchange={() => onchange(option.value)}
			/>
			<span>{option.label}</span>
		</label>
	{/each}
</div>
