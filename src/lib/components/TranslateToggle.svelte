<script lang="ts">
	import { translatePost } from '$lib/api/appview';
	let { uri }: { uri: string } = $props();
	let translated = $state('');
	let busy = $state(false);
	async function run() {
		busy = true;
		try {
			translated = (await translatePost(uri, navigator.language)).text;
		} finally {
			busy = false;
		}
	}
</script>

<button class="read" onclick={run} disabled={busy}>{busy ? '翻訳中…' : '翻訳'}</button
>{#if translated}<p>{translated}</p>{/if}
