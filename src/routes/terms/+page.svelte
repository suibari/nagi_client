<script lang="ts">
	import { i18n } from '$lib/i18n/i18n.svelte';
	import TermsJa from './TermsJa.svelte';
	import TermsEn from './TermsEn.svelte';
</script>

<section class="card prose">
	{#if i18n.locale === 'ja'}
		<TermsJa />
	{:else}
		<TermsEn />
	{/if}
</section>
