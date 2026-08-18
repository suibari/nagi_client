<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
</script>

<div class="diary-private-notice">
	<Icon name="hide" size={16} />
	<p>{m.diaryPrivate()}</p>
</div>

<style>
	.diary-private-notice {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		border: 1px dashed var(--border);
		border-radius: 12px;
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
