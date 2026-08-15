<script lang="ts">
	import { AVAILABLE_SELF_LABELS } from '$lib/post/labels';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	interface Props {
		selectedLabels: string[];
		disabled?: boolean;
		onchange?: (labels: string[]) => void;
	}

	let { selectedLabels = $bindable([]), disabled = false, onchange }: Props = $props();

	let open = $state(false);

	function toggleLabel(val: string) {
		if (disabled) return;
		if (selectedLabels.includes(val)) {
			selectedLabels = selectedLabels.filter((l) => l !== val);
		} else {
			selectedLabels = [...selectedLabels, val];
		}
		onchange?.(selectedLabels);
	}

	function toggleOpen(e: MouseEvent) {
		e.stopPropagation();
		open = !open;
	}

	// 外側クリックで閉じる
	function handleWindowClick(e: MouseEvent) {
		if (open) {
			open = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="relative inline-block text-left" onclick={(e) => e.stopPropagation()}>
	<button
		type="button"
		class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer {selectedLabels.length >
		0
			? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300'
			: 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400'}"
		{disabled}
		onclick={toggleOpen}
		aria-haspopup="true"
		aria-expanded={open}
		title={m.selfLabelPickerTitle()}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
			<path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
		</svg>
		<span>
			{#if selectedLabels.length === 0}
				{m.selfLabelButton()}
			{:else}
				{m.selfLabelSelected({ count: selectedLabels.length })}
			{/if}
		</span>
	</button>

	{#if open}
		<div
			class="absolute left-0 bottom-full mb-2 w-64 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
			role="menu"
		>
			<div class="px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-700/50 mb-1">
				<p class="text-xs font-bold text-neutral-800 dark:text-neutral-200">
					{m.selfLabelPickerTitle()}
				</p>
				<p class="text-[10px] text-neutral-500">{m.selfLabelPickerHelp()}</p>
			</div>

			<div class="space-y-1">
				{#each AVAILABLE_SELF_LABELS as opt}
					{@const isSelected = selectedLabels.includes(opt.value)}
					<button
						type="button"
						class="w-full flex items-start gap-2 p-2 rounded-xl text-left transition cursor-pointer {isSelected
							? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200'
							: 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300'}"
						onclick={() => toggleLabel(opt.value)}
					>
						<input
							type="checkbox"
							checked={isSelected}
							class="mt-0.5 rounded text-amber-500 focus:ring-0 cursor-pointer pointer-events-none"
							tabindex="-1"
						/>
						<div class="flex-1 min-w-0">
							<p class="text-xs font-semibold">{opt.badgeText[i18n.locale]}</p>
							<p class="text-[10px] opacity-75 leading-tight">{opt.description[i18n.locale]}</p>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
