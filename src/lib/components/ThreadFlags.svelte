<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';

	let { kossori = false }: { kossori?: boolean } = $props();
</script>

{#if kossori}
	<header class="thread-flags">
		<span class="kossori-badge" title={m.kossoriBadgeAria()} aria-label={m.kossoriBadgeAria()}
			><Icon name="hide" size={12} />{m.kossoriBadge()}</span
		>
	</header>
{/if}
