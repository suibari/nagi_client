<script lang="ts">
	import type { InlineRun } from '$lib/atproto/markdown';
	import ContentWarningMask from './ContentWarningMask.svelte';
	import BluemojiMedia from './BluemojiMedia.svelte';
	let { runs, warningState }: { runs: InlineRun[]; warningState: { revealed: boolean } } = $props();
	let unavailable = $state<string[]>([]);
</script>

{#each runs as run}{#snippet body()}{#if run.bluemoji && !unavailable.includes(run.bluemoji.uri)}<BluemojiMedia
				class="inline-bluemoji"
				emoji={run.bluemoji}
				onunavailable={() => (unavailable = [...unavailable, run.bluemoji!.uri])}
			/>{:else if run.href}<a
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
			>{:else}{@render struck()}{/if}{/snippet}{#snippet formatted()}{#if run.marks.includes('bold')}<strong
				>{@render emphasized()}</strong
			>{:else}{@render emphasized()}{/if}{/snippet}{#if run.contentWarning}<ContentWarningMask
			bind:revealed={warningState.revealed}
			showIcon={Boolean(run.contentWarningStart)}>{@render formatted()}</ContentWarningMask
		>{:else}{@render formatted()}{/if}{/each}

<style>
	/*
		高さは文字の選択ハイライト（フォントの ascent + descent、Noto Sans JP で約1.45em）に合わせる。
		1.25em だと選択したときに絵文字だけ低く見えた。行の高さ（1.8〜2）の内側に収まる。
	*/
	:global(.inline-bluemoji) {
		display: inline-flex;
		min-width: 1.5em;
		height: 1.5em;
		vertical-align: -0.375em;
	}

	:global(.inline-bluemoji img) {
		width: auto;
		height: 100%;
		object-fit: contain;
	}

	:global(.inline-bluemoji canvas) {
		width: 1.5em;
		height: 100%;
	}
</style>
