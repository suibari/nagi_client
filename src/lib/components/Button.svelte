<script lang="ts">
	/**
	 * 文字付きの操作ボタン。アプリ中の「押すもの」の見た目はここにだけ持つ。
	 *
	 * - primary: その画面でいちばん進めたい操作。1画面に1つを目安にする。
	 * - secondary: 並ぶ控えの操作（キャンセル・閉じる・もっと見る など）。
	 * - ghost: 文中や密な場所の軽い操作。枠を持たない。
	 * - danger: 取り消せない削除などの確定。
	 *
	 * href を渡すとリンク（a）として描く。ボタン風のリンクも同じ見た目にするため。
	 * アイコンだけのボタン・タブ・メニュー項目・トグルは形が違うので、ここでは扱わない。
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';
	type Props = {
		variant?: Variant;
		size?: Size;
		/** 親の幅いっぱいに広げる。 */
		block?: boolean;
		href?: string;
		ref?: HTMLElement;
		children: Snippet;
	} & Omit<HTMLButtonAttributes, 'children'> &
		Omit<HTMLAnchorAttributes, 'children'>;

	let {
		variant = 'secondary',
		size = 'md',
		block = false,
		href,
		ref = $bindable(),
		class: className,
		type = 'button',
		children,
		...rest
	}: Props = $props();

	const classes = $derived([
		'btn',
		`btn-${variant}`,
		`btn-${size}`,
		block && 'btn-block',
		className,
	]);
</script>

{#if href}
	<a bind:this={ref} {href} class={classes} {...rest as HTMLAnchorAttributes}
		>{@render children()}</a
	>
{:else}
	<button bind:this={ref} {type} class={classes} {...rest as HTMLButtonAttributes}
		>{@render children()}</button
	>
{/if}
