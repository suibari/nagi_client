<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	interface Props {
		shouldBlur: boolean;
		warningText?: string;
		children?: Snippet;
	}

	let { shouldBlur = false, warningText, children }: Props = $props();

	let revealed = $state(false);

	function toggleReveal(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		revealed = !revealed;
	}
</script>

<div class="relative overflow-hidden rounded-2xl group">
	<div
		class="transition-all duration-300 {shouldBlur && !revealed
			? 'filter blur-xl scale-105 select-none pointer-events-none'
			: ''}"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if shouldBlur && !revealed}
		<div
			class="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-md text-white transition-opacity duration-200"
		>
			<div class="flex items-center gap-2 mb-2 text-amber-300 font-bold text-sm sm:text-base">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
					<path
						d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"
					/>
				</svg>
				<span>{warningText ?? m.moderationWarning()}</span>
			</div>
			<p class="text-xs text-white/80 mb-3 text-center">{m.moderationRevealHelp()}</p>
			<button
				type="button"
				class="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-semibold backdrop-blur transition cursor-pointer border border-white/30"
				onclick={toggleReveal}
			>
				{m.moderationReveal()}
			</button>
		</div>
	{:else if shouldBlur && revealed}
		<button
			type="button"
			class="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white/90 text-[11px] font-medium backdrop-blur transition cursor-pointer border border-white/20 opacity-75 hover:opacity-100"
			onclick={toggleReveal}
			title={m.moderationHideAgain()}
		>
			🙈 {m.moderationHideAgain()}
		</button>
	{/if}
</div>
