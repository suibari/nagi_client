<script lang="ts">
	import { onMount } from 'svelte';

	type RectReport = {
		selector: string;
		left: number;
		right: number;
		top: number;
		bottom: number;
		width: number;
		height: number;
		clientWidth: number;
		scrollWidth: number;
		position: string;
		display: string;
		overflowX: string;
		overflowY: string;
		transform: string;
		contain: string;
	};

	let report = $state<Record<string, unknown>>();
	let copied = $state(false);
	let unitProbe: HTMLDivElement;

	const round = (value: number) => Math.round(value * 10) / 10;

	function selectorOf(element: Element): string {
		if (element === document.documentElement) return 'html';
		if (element === document.body) return 'body';
		if (element.id) return `#${CSS.escape(element.id)}`;
		const classes = [...element.classList]
			.slice(0, 3)
			.map((name) => `.${CSS.escape(name)}`)
			.join('');
		const own = `${element.tagName.toLowerCase()}${classes}`;
		const parent = element.parentElement;
		if (!parent || parent === document.body) return own;
		const sameTags = [...parent.children].filter((child) => child.tagName === element.tagName);
		const nth = sameTags.length > 1 ? `:nth-of-type(${sameTags.indexOf(element) + 1})` : '';
		return `${selectorOf(parent)} > ${own}${nth}`;
	}

	function inspect(element: HTMLElement): RectReport {
		const rect = element.getBoundingClientRect();
		const style = getComputedStyle(element);
		return {
			selector: selectorOf(element),
			left: round(rect.left),
			right: round(rect.right),
			top: round(rect.top),
			bottom: round(rect.bottom),
			width: round(rect.width),
			height: round(rect.height),
			clientWidth: element.clientWidth,
			scrollWidth: element.scrollWidth,
			position: style.position,
			display: style.display,
			overflowX: style.overflowX,
			overflowY: style.overflowY,
			transform: style.transform,
			contain: style.contain,
		};
	}

	function measureWithoutBodyChildren(): number {
		const children = [...document.body.children] as HTMLElement[];
		const displays = children.map((element) => element.style.display);
		for (const element of children) element.style.display = 'none';
		const width = document.documentElement.scrollWidth;
		children.forEach((element, index) => (element.style.display = displays[index] ?? ''));
		return width;
	}

	function capture() {
		const root = document.documentElement;
		const viewportWidth = root.clientWidth;
		const elements = [...document.querySelectorAll<HTMLElement>('body *')].filter(
			(element) => !element.closest('[data-layout-debug]'),
		);
		const inspected = elements.map(inspect);
		const offenders = inspected
			.filter(
				(item) =>
					item.right > viewportWidth + 1 ||
					item.left < -1 ||
					item.scrollWidth > item.clientWidth + 1,
			)
			.sort(
				(a, b) =>
					Math.max(b.right - viewportWidth, b.scrollWidth - b.clientWidth, -b.left) -
					Math.max(a.right - viewportWidth, a.scrollWidth - a.clientWidth, -a.left),
			)
			.slice(0, 20);
		const visual = window.visualViewport;
		const probes = [...unitProbe.children].map((element) => ({
			unit: (element as HTMLElement).dataset.unit,
			width: round((element as HTMLElement).getBoundingClientRect().width),
			height: round((element as HTMLElement).getBoundingClientRect().height),
		}));
		const viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
		const emptyWidth = measureWithoutBodyChildren();

		report = {
			capturedAt: new Date().toISOString(),
			location: location.href,
			userAgent: navigator.userAgent,
			viewportMeta: viewportMeta?.content,
			screen: {
				width: screen.width,
				height: screen.height,
				availableWidth: screen.availWidth,
				availableHeight: screen.availHeight,
				devicePixelRatio: window.devicePixelRatio,
				outerWidth: window.outerWidth,
				outerHeight: window.outerHeight,
			},
			viewport: {
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight,
				visualWidth: visual ? round(visual.width) : undefined,
				visualHeight: visual ? round(visual.height) : undefined,
				visualScale: visual ? round(visual.scale) : undefined,
				visualOffsetLeft: visual ? round(visual.offsetLeft) : undefined,
				visualOffsetTop: visual ? round(visual.offsetTop) : undefined,
				visualPageLeft: visual ? round(visual.pageLeft) : undefined,
				visualPageTop: visual ? round(visual.pageTop) : undefined,
				cssUnits: probes,
			},
			document: {
				scrollingElement: document.scrollingElement?.tagName.toLowerCase(),
				clientWidth: root.clientWidth,
				scrollWidth: root.scrollWidth,
				clientHeight: root.clientHeight,
				scrollHeight: root.scrollHeight,
				bodyClientWidth: document.body.clientWidth,
				bodyScrollWidth: document.body.scrollWidth,
				scrollX: round(window.scrollX),
				scrollY: round(window.scrollY),
				scrollWidthWithoutBodyChildren: emptyWidth,
			},
			roots: [
				inspect(root),
				inspect(document.body),
				...[...document.body.children].map((child) => inspect(child as HTMLElement)),
			],
			fixed: inspected.filter((item) => item.position === 'fixed'),
			offenders,
		};
		copied = false;
	}

	async function copyReport() {
		if (!report) return;
		await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
		copied = true;
	}

	onMount(() => {
		capture();
		const timers = [500, 2_000, 5_000].map((delay) => window.setTimeout(capture, delay));
		return () => timers.forEach(window.clearTimeout);
	});
</script>

<div class="unit-probe" bind:this={unitProbe} aria-hidden="true" data-layout-debug>
	<i data-unit="vw/vh"></i>
	<i data-unit="vw/dvh"></i>
	<i data-unit="vw/svh"></i>
	<i data-unit="vw/lvh"></i>
</div>

<section class="layout-debug" data-layout-debug>
	<header>
		<strong>Layout debug 2</strong>
		<button type="button" onclick={capture}>再計測</button>
		<button type="button" onclick={() => void copyReport()} disabled={!report}>
			{copied ? 'コピー済み' : '結果をコピー'}
		</button>
	</header>
	{#if report}<pre>{JSON.stringify(report, null, 2)}</pre>{/if}
</section>

<style>
	.unit-probe {
		position: absolute;
		inline-size: 0;
		block-size: 0;
		contain: strict;
		overflow: hidden;
	}
	.unit-probe i {
		display: block;
		inline-size: 100vw;
	}
	.unit-probe i:nth-child(1) {
		block-size: 100vh;
	}
	.unit-probe i:nth-child(2) {
		block-size: 100dvh;
	}
	.unit-probe i:nth-child(3) {
		block-size: 100svh;
	}
	.unit-probe i:nth-child(4) {
		block-size: 100lvh;
	}
	.layout-debug {
		position: relative;
		z-index: 10000;
		inline-size: 100%;
		max-inline-size: 100vw;
		max-block-size: 48dvh;
		overflow: auto;
		padding: 8px;
		border: 3px solid #ff3b30;
		background: #fff;
		color: #111;
		font:
			12px/1.35 ui-monospace,
			monospace;
	}
	.layout-debug header {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
	}
	.layout-debug button {
		min-block-size: 32px;
		padding: 4px 8px;
		border: 1px solid #555;
		background: #eee;
		color: #111;
	}
	.layout-debug pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
