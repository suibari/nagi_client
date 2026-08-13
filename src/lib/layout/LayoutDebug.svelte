<script lang="ts">
	import { onMount } from 'svelte';

	type ElementReport = {
		selector: string;
		tag: string;
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
		transform: string;
		contain: string;
		filter: string;
		perspective: string;
		willChange: string;
		parent: string;
	};

	type LayoutReport = {
		capturedAt: string;
		location: string;
		userAgent: string;
		viewport: {
			innerWidth: number;
			innerHeight: number;
			visualWidth?: number;
			visualHeight?: number;
			visualScale?: number;
		};
		document: {
			scrollingElement: string;
			documentClientWidth: number;
			documentScrollWidth: number;
			documentClientHeight: number;
			documentScrollHeight: number;
			bodyClientWidth: number;
			bodyScrollWidth: number;
			scrollX: number;
			scrollY: number;
		};
		fixed: ElementReport[];
		offenders: ElementReport[];
	};

	let report = $state<LayoutReport>();
	let copied = $state(false);

	function round(value: number): number {
		return Math.round(value * 10) / 10;
	}

	function selectorOf(element: Element): string {
		if (element.id) return `#${CSS.escape(element.id)}`;
		const classes = [...element.classList]
			.slice(0, 3)
			.map((name) => `.${CSS.escape(name)}`)
			.join('');
		const own = `${element.tagName.toLowerCase()}${classes}`;
		const parent = element.parentElement;
		if (!parent || parent === document.body) return own;
		const siblings = [...parent.children].filter((child) => child.tagName === element.tagName);
		const suffix = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(element) + 1})` : '';
		return `${selectorOf(parent)} > ${own}${suffix}`;
	}

	function inspect(element: HTMLElement): ElementReport {
		const rect = element.getBoundingClientRect();
		const style = getComputedStyle(element);
		return {
			selector: selectorOf(element),
			tag: element.tagName.toLowerCase(),
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
			transform: style.transform,
			contain: style.contain,
			filter: style.filter,
			perspective: style.perspective,
			willChange: style.willChange,
			parent: element.parentElement ? selectorOf(element.parentElement) : '',
		};
	}

	function capture() {
		const viewportWidth = document.documentElement.clientWidth;
		const elements = [...document.querySelectorAll<HTMLElement>('body *')].filter(
			(element) => !element.closest('[data-layout-debug]'),
		);
		const inspected = elements.map(inspect);
		const overflow = inspected
			.filter(
				(item) =>
					item.right > viewportWidth + 1 ||
					item.left < -1 ||
					item.scrollWidth > item.clientWidth + 1,
			)
			.sort((a, b) => {
				const aOverflow = Math.max(a.right - viewportWidth, a.scrollWidth - a.clientWidth, -a.left);
				const bOverflow = Math.max(b.right - viewportWidth, b.scrollWidth - b.clientWidth, -b.left);
				return bOverflow - aOverflow;
			})
			.slice(0, 30);

		report = {
			capturedAt: new Date().toISOString(),
			location: location.href,
			userAgent: navigator.userAgent,
			viewport: {
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight,
				visualWidth: window.visualViewport ? round(window.visualViewport.width) : undefined,
				visualHeight: window.visualViewport ? round(window.visualViewport.height) : undefined,
				visualScale: window.visualViewport ? round(window.visualViewport.scale) : undefined,
			},
			document: {
				scrollingElement: document.scrollingElement?.tagName.toLowerCase() ?? '',
				documentClientWidth: document.documentElement.clientWidth,
				documentScrollWidth: document.documentElement.scrollWidth,
				documentClientHeight: document.documentElement.clientHeight,
				documentScrollHeight: document.documentElement.scrollHeight,
				bodyClientWidth: document.body.clientWidth,
				bodyScrollWidth: document.body.scrollWidth,
				scrollX: round(window.scrollX),
				scrollY: round(window.scrollY),
			},
			fixed: inspected.filter((item) => item.position === 'fixed'),
			offenders: overflow,
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
		// my Nagi の各API応答と画像反映後も採取し直す。
		const timers = [500, 2_000, 5_000].map((delay) => window.setTimeout(capture, delay));
		return () => timers.forEach(window.clearTimeout);
	});
</script>

<section class="layout-debug" data-layout-debug>
	<header>
		<strong>Layout debug</strong>
		<button type="button" onclick={capture}>再計測</button>
		<button type="button" onclick={() => void copyReport()} disabled={!report}>
			{copied ? 'コピー済み' : '結果をコピー'}
		</button>
	</header>
	{#if report}
		<p>
			viewport {report.viewport.innerWidth}px / document {report.document.documentScrollWidth}px /
			body {report.document.bodyScrollWidth}px / x={report.document.scrollX}, y={report.document
				.scrollY}
		</p>
		<details open>
			<summary>幅超過候補（{report.offenders.length}件）</summary>
			<ol>
				{#each report.offenders as item}
					<li>
						<code>{item.selector}</code><br />
						rect={item.left}..{item.right} ({item.width}px), scroll={item.scrollWidth}/{item.clientWidth},
						position={item.position}, overflow-x={item.overflowX}, transform={item.transform},
						contain={item.contain}, filter={item.filter}, perspective={item.perspective},
						will-change={item.willChange}
					</li>
				{/each}
			</ol>
		</details>
		<details>
			<summary>fixed要素（{report.fixed.length}件）</summary>
			<ol>
				{#each report.fixed as item}
					<li>
						<code>{item.selector}</code>: x={item.left}..{item.right}, y={item.top}..{item.bottom},
						size={item.width}×{item.height}px, parent=<code>{item.parent}</code>
					</li>
				{/each}
			</ol>
		</details>
	{/if}
</section>

<style>
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
	.layout-debug p {
		margin: 6px 0;
		font-weight: 700;
	}
	.layout-debug ol {
		margin: 4px 0;
		padding-inline-start: 24px;
	}
	.layout-debug li + li {
		margin-block-start: 8px;
	}
	.layout-debug code {
		overflow-wrap: anywhere;
	}
</style>
