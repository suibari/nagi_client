<script lang="ts">
	import { translatePost } from '$lib/api/appview';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	let { uri }: { uri: string } = $props();
	let translated = $state('');
	let busy = $state(false);
	async function run() {
		busy = true;
		try {
			translated = (await translatePost(uri, i18n.locale)).text;
		} finally {
			busy = false;
		}
	}
</script>

<button class="read" onclick={run} disabled={busy}>{busy ? m.translating() : m.translate()}</button
>{#if translated}<p>{translated}</p>{/if}
