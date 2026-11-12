<script module lang="ts">
	/**
	 * スクラバーが避ける上下の余白（px）。上はモバイルの固定ヘッダー、下はボトムナビと
	 * 投稿ボタン。年表の末尾へのスクロールも同じ値で計算し、最新の節目を隠さない。
	 */
	export function chronicleInsets(): { top: number; bottom: number } {
		if (typeof window === 'undefined') return { top: 16, bottom: 24 };
		if (!matchMedia('(max-width: 767px)').matches) return { top: 16, bottom: 24 };
		const header =
			parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue('--mobile-header-h'),
			) || 56;
		return { top: header + 12, bottom: 156 };
	}

	/** 年表本体の末尾が下の余白の上に来るスクロール量。 */
	export function chronicleEndScrollY(body: HTMLElement): number {
		const rect = body.getBoundingClientRect();
		return Math.max(0, rect.bottom + scrollY - innerHeight + chronicleInsets().bottom);
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		scrubProgress,
		scrubScrollY,
		scrubTicks,
		scrubYearAt,
		visibleTickYears,
		type ScrubRange,
		type ScrubTick,
	} from '$lib/chronicle/scrub';

	let { body, years }: { body: HTMLElement; years: string[] } = $props();

	const THUMB = 28;
	let insets = $state({ top: 16, bottom: 24 });
	let range = $state<ScrubRange>({ start: 0, end: 0 });
	let ticks = $state<ScrubTick[]>([]);
	let progress = $state(1);
	let trackPx = $state(0);
	let dragging = $state(false);
	let track = $state<HTMLElement>();

	const year = $derived(scrubYearAt(ticks, progress) ?? years[years.length - 1]);
	const labeled = $derived(visibleTickYears(ticks, Math.max(0, trackPx - THUMB), 20));

	function measure() {
		insets = chronicleInsets();
		const rect = body.getBoundingClientRect();
		const top = rect.top + scrollY;
		// ページ下の余白が足りないと末尾まで届かず、最新の年に着かなくなる。実際の最大値で頭打ちにする。
		const maxScroll = document.documentElement.scrollHeight - innerHeight;
		range = { start: top - insets.top, end: Math.min(chronicleEndScrollY(body), maxScroll) };
		ticks = scrubTicks(
			[...body.querySelectorAll<HTMLElement>('[data-chronicle-year]')].map((node) => ({
				year: node.dataset.chronicleYear!,
				top: node.getBoundingClientRect().top + scrollY - insets.top,
			})),
			range,
		);
		trackPx = track?.clientHeight ?? 0;
		progress = scrubProgress(scrollY, range);
	}

	$effect(() => {
		void years.length;
		// measure は自分で書いた range を読むので、追跡すると自身を再実行し続ける。
		untrack(measure);
		let frame = 0;
		const onScroll = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				if (!dragging) progress = scrubProgress(scrollY, range);
			});
		};
		const resize = new ResizeObserver(() => untrack(measure));
		resize.observe(body);
		if (track) resize.observe(track);
		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('resize', measure);
		return () => {
			cancelAnimationFrame(frame);
			resize.disconnect();
			removeEventListener('scroll', onScroll);
			removeEventListener('resize', measure);
		};
	});

	function jump(next: number) {
		progress = Math.min(1, Math.max(0, next));
		// 指の動きにそのまま追従させたいので、smoothにしない。
		scrollTo({ top: scrubScrollY(progress, range), behavior: 'instant' });
	}

	function fromPointer(event: PointerEvent) {
		const rect = track!.getBoundingClientRect();
		jump((event.clientY - rect.top - THUMB / 2) / Math.max(1, rect.height - THUMB));
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0 || !track) return;
		event.preventDefault();
		measure();
		dragging = true;
		// 指がレールの外へ出てもドラッグを続ける。
		track.setPointerCapture(event.pointerId);
		fromPointer(event);
	}

	function onPointerMove(event: PointerEvent) {
		if (dragging) fromPointer(event);
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		track?.releasePointerCapture(event.pointerId);
	}

	function onKeydown(event: KeyboardEvent) {
		const eps = 0.002;
		let next: number | undefined;
		if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = 1;
		else if (event.key === 'ArrowUp' || event.key === 'PageUp')
			next = [...ticks].reverse().find((tick) => tick.at < progress - eps)?.at ?? 0;
		else if (event.key === 'ArrowDown' || event.key === 'PageDown')
			next = ticks.find((tick) => tick.at > progress + eps)?.at ?? 1;
		if (next === undefined) return;
		event.preventDefault();
		measure();
		jump(next);
	}
</script>

<div class="scrub" style:--scrub-top="{insets.top}px" style:--scrub-bottom="{insets.bottom}px">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="scrub-track"
		class:dragging
		bind:this={track}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
	>
		{#each ticks as tick (tick.year)}
			<span
				class="scrub-tick"
				class:labeled={labeled.has(tick.year)}
				class:current={tick.year === year}
				style:top="calc({tick.at} * (100% - {THUMB}px) + {THUMB / 2}px)"
				aria-hidden="true"
			>
				<span class="scrub-tick-label">{tick.year}</span>
			</span>
		{/each}
		<span class="scrub-now" aria-hidden="true">{m.chronicleScrubberNow()}</span>
		<div
			class="scrub-thumb"
			role="slider"
			tabindex="0"
			aria-label={m.chronicleScrubberAria()}
			aria-orientation="vertical"
			aria-valuemin={Number(years[0])}
			aria-valuemax={Number(years[years.length - 1])}
			aria-valuenow={Number(year)}
			aria-valuetext={m.chronicleYearValue({ year: year ?? '' })}
			style:top="calc({progress} * (100% - {THUMB}px))"
			onkeydown={onKeydown}
		>
			{#if dragging}
				<span class="scrub-bubble" aria-hidden="true">{year}</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.scrub {
		position: sticky;
		inset-block-start: var(--scrub-top);
		block-size: min(calc(100dvh - var(--scrub-top) - var(--scrub-bottom)), 100%);
		padding-block: 4px;
		touch-action: none;
		user-select: none;
	}
	.scrub-track {
		position: relative;
		block-size: 100%;
		cursor: pointer;
	}
	/* レール本体。目盛りとつまみはこの線の上に載る。 */
	.scrub-track::before {
		content: '';
		position: absolute;
		inset-block: 14px;
		inset-inline-end: 11px;
		inline-size: 2px;
		border-radius: 1px;
		background: var(--line);
	}
	.scrub-tick {
		position: absolute;
		inset-inline-end: 8px;
		display: flex;
		align-items: center;
		gap: 4px;
		translate: 0 -50%;
		pointer-events: none;
	}
	.scrub-tick::after {
		content: '';
		inline-size: 8px;
		block-size: 2px;
		border-radius: 1px;
		background: var(--line-strong);
	}
	.scrub-tick-label {
		visibility: hidden;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		color: var(--text-faint);
		transition: color 0.16s ease;
	}
	.scrub-tick.labeled .scrub-tick-label {
		visibility: visible;
	}
	.scrub-tick.current .scrub-tick-label {
		color: var(--text-strong);
	}
	.scrub-now {
		position: absolute;
		inset-block-end: -4px;
		inset-inline-end: 0;
		inline-size: 24px;
		font-size: 10px;
		line-height: 1;
		text-align: center;
		color: var(--accent-strong);
		translate: 0 100%;
		pointer-events: none;
	}
	/* 栞。上が平らで下に切り込みのある形を、当たり判定より小さく描く。 */
	.scrub-thumb {
		position: absolute;
		inset-inline-end: 0;
		inline-size: 24px;
		block-size: 28px;
		display: grid;
		place-items: center;
		border-radius: 6px;
		cursor: grab;
		touch-action: none;
	}
	.scrub-thumb::before {
		content: '';
		inline-size: 12px;
		block-size: 20px;
		background: var(--accent-strong);
		clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%);
		transition: scale 0.16s ease;
	}
	.dragging .scrub-thumb {
		cursor: grabbing;
	}
	.dragging .scrub-thumb::before {
		scale: 1.15;
	}
	.scrub-thumb:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 2px;
	}
	.scrub-bubble {
		position: absolute;
		inset-inline-end: calc(100% + 12px);
		inset-block-start: 50%;
		translate: 0 -50%;
		padding: 4px 12px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--surface-1);
		box-shadow: 0 4px 16px rgb(0 0 0 / 0.08);
		font-size: 28px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
		color: var(--text-strong);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
