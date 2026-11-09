<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PostView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { contentModerationDisplay } from '$lib/moderation/preferences.svelte';
	import { automaticModerationReasons } from '$lib/moderation/reasons';
	import ContentWarningMask from './ContentWarningMask.svelte';

	let {
		post,
		children,
	}: {
		post: Pick<PostView, 'uri' | 'selfLabels' | 'moderationLabels' | 'images' | 'video'>;
		children: Snippet;
	} = $props();
	let display = $derived(contentModerationDisplay(post));
	let title = $derived(
		display.reason === 'automatic'
			? m.moderationAutomaticWarning()
			: display.reason === 'selfNsfw'
				? m.moderationSelfNsfwWarning()
				: m.moderationSelfAiWarning(),
	);
	let reasons = $derived(
		display.reason === 'automatic' ? automaticModerationReasons(post.moderationLabels) : [],
	);
</script>

{#if !display.hidden}
	{#key post.uri}
		<ContentWarningMask kind="content" active={display.warn} {title} {reasons}>
			{@render children()}
		</ContentWarningMask>
	{/key}
{/if}
