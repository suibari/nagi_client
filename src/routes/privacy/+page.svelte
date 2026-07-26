<script lang="ts">
	import { i18n } from '$lib/i18n/i18n.svelte';
	import PrivacyJa from './PrivacyJa.svelte';
	import PrivacyEn from './PrivacyEn.svelte';
</script>

<section class="card prose">
	{#if i18n.locale === 'ja'}
		<PrivacyJa />
	{:else}
		<PrivacyEn />
	{/if}
</section>
