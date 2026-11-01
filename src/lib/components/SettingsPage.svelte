<script lang="ts">
	/**
	 * 設定の各ページの枠。設定トップと同じ列幅で、見出しと「設定に戻る」を揃える。
	 * 中身は SettingsSection（面）と SettingRow（行）で組む。
	 */
	import type { Snippet } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		title,
		description,
		back,
		actions,
		class: className,
		children,
	}: {
		title: string;
		description?: string;
		/** 戻り先を設定トップ以外にしたいとき（例: フィードから来たタブ設定）。null で出さない。 */
		back?: { href: string; label: string } | null;
		actions?: Snippet;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<section class={['settings-detail', className]}>
	<PageHeader
		{title}
		{description}
		{actions}
		back={back === null ? undefined : (back ?? { href: '/settings', label: m.backToSettings() })}
	/>
	{@render children()}
</section>
