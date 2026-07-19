<script lang="ts">
	import { onMount } from 'svelte';
	import jaI18n from 'emoji-picker-element/i18n/ja';
	import enI18n from 'emoji-picker-element/i18n/en';
	import emojiDataUrlJa from 'emoji-picker-element-data/ja/emojibase/data.json?url';
	import emojiDataUrlEn from 'emoji-picker-element-data/en/emojibase/data.json?url';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	let {
		anchor,
		select,
		close,
	}: { anchor: HTMLElement; select: (emoji: string) => void; close: () => void } = $props();
	let host: HTMLDivElement;
	let positionStyle = $state('');
	let positioned = $state(false);

	const VIEWPORT_MARGIN = 16;
	const ANCHOR_GAP = 8;
	const DESKTOP_BREAKPOINT = 768;
	const PICKER_WIDTH = 352;
	const PICKER_HEIGHT = 440;

	onMount(() => {
		let disposed = false;
		let picker: HTMLElement | undefined;
		let positionFrame: number | undefined;

		const updatePosition = () => {
			positionFrame = undefined;
			if (window.innerWidth < DESKTOP_BREAKPOINT) {
				positionStyle = '';
				positioned = true;
				return;
			}

			const anchorRect = anchor.getBoundingClientRect();
			const width = Math.min(PICKER_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
			const belowTop = anchorRect.bottom + ANCHOR_GAP;
			const belowSpace = window.innerHeight - VIEWPORT_MARGIN - belowTop;
			const aboveSpace = anchorRect.top - ANCHOR_GAP - VIEWPORT_MARGIN;
			const openBelow = belowSpace >= PICKER_HEIGHT || belowSpace >= aboveSpace;
			const height = Math.min(PICKER_HEIGHT, Math.max(0, openBelow ? belowSpace : aboveSpace));
			const preferredLeft = anchorRect.right - width;
			const left = Math.min(
				Math.max(VIEWPORT_MARGIN, preferredLeft),
				window.innerWidth - VIEWPORT_MARGIN - width,
			);
			const top = openBelow ? belowTop : anchorRect.top - ANCHOR_GAP - height;

			positionStyle = `top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px;`;
			positioned = true;
		};
		const schedulePositionUpdate = () => {
			if (positionFrame !== undefined) return;
			positionFrame = requestAnimationFrame(updatePosition);
		};

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') close();
		};
		const handlePointerDown = (event: PointerEvent) => {
			if (!host.contains(event.target as Node)) close();
		};

		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('pointerdown', handlePointerDown);
		window.addEventListener('resize', schedulePositionUpdate);
		window.addEventListener('scroll', schedulePositionUpdate, true);
		updatePosition();
		void import('emoji-picker-element').then(({ Picker }) => {
			if (disposed) return;
			const locale = i18n.locale;
			picker = new Picker({
				locale,
				dataSource: locale === 'ja' ? emojiDataUrlJa : emojiDataUrlEn,
				i18n: {
					...(locale === 'ja' ? jaI18n : enI18n),
					favoritesLabel: m.emojiFavoritesLabel(),
					searchLabel: m.emojiSearchLabel(),
				},
			});
			picker.addEventListener('emoji-click', (event) => {
				const emoji = (event as CustomEvent<{ unicode?: string }>).detail.unicode;
				if (emoji) select(emoji);
			});
			host.append(picker);
			requestAnimationFrame(() => {
				picker?.shadowRoot?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
			});
		});

		return () => {
			disposed = true;
			if (positionFrame !== undefined) cancelAnimationFrame(positionFrame);
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('pointerdown', handlePointerDown);
			window.removeEventListener('resize', schedulePositionUpdate);
			window.removeEventListener('scroll', schedulePositionUpdate, true);
			picker?.remove();
		};
	});
</script>

<div
	bind:this={host}
	class="emoji-picker"
	class:positioned
	style={positionStyle}
	role="dialog"
	aria-label={m.emojiPickerAria()}
></div>
