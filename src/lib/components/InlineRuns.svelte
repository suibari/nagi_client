<script lang="ts">
	import type { InlineRun } from '$lib/atproto/markdown';
	let { runs }: { runs: InlineRun[] } = $props();
</script>

{#each runs as run}{#snippet body()}{#if run.href}<a
				class="rich-link"
				href={run.href}
				target={run.external ? '_blank' : undefined}
				rel={run.external ? 'noopener noreferrer' : undefined}>{run.text}</a
			>{:else}{run.text}{/if}{/snippet}{#snippet coded()}{#if run.marks.includes('code')}<code
				>{@render body()}</code
			>{:else}{@render body()}{/if}{/snippet}{#snippet struck()}{#if run.marks.includes('strike')}<s
				>{@render coded()}</s
			>{:else}{@render coded()}{/if}{/snippet}{#snippet emphasized()}{#if run.marks.includes('italic')}<em
				>{@render struck()}</em
			>{:else}{@render struck()}{/if}{/snippet}{#if run.marks.includes('bold')}<strong
			>{@render emphasized()}</strong
		>{:else}{@render emphasized()}{/if}{/each}
