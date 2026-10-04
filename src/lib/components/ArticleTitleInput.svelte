<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	let { value = $bindable(''), disabled = false }: { value?: string; disabled?: boolean } =
		$props();
</script>

<label class="article-edit-title">
	<span>{m.standardSiteTitleLabel()}</span>
	<input
		type="text"
		bind:value
		{disabled}
		required
		placeholder={m.standardSiteTitlePlaceholder()}
	/>
</label>

<style>
	.article-edit-title {
		display: grid;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	input {
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		padding: 10px;
		font: inherit;
		color: var(--text);
		background: var(--bg-raised);
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
	}
</style>
