<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PostView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { contentModerationDisplay } from '$lib/moderation/preferences.svelte';
	import ContentWarningMask from './ContentWarningMask.svelte';

	let { post, children }: { post: PostView; children: Snippet } = $props();
	let display = $derived(contentModerationDisplay(post));
	let title = $derived(
		display.reason === 'automatic'
			? m.moderationAutomaticWarning()
			: display.reason === 'selfNsfw'
				? m.moderationSelfNsfwWarning()
				: m.moderationSelfAiWarning(),
	);
</script>

{#if !display.hidden}
	{#key post.uri}
		<ContentWarningMask kind="content" active={display.warn} {title}>
			{@render children()}
		</ContentWarningMask>
	{/key}
{/if}
