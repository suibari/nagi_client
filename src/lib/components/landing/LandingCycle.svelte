<script lang="ts">
	/**
	 * 3本柱が「書く → つながる → 振り返る → また書く」と循環していることを見せる輪。
	 * 輪の上の3点は下の各柱へのリンクで、中央に「また書きたくなる」を置く。
	 * 矢印は時計回りの円弧で、点の手前で切って重ならないようにする。装飾なので読み上げからは外し、
	 * 意味はリンクの並び（1 → 2 → 3）と中央の文で伝える。
	 */
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	const SIZE = 300;
	const CENTER = SIZE / 2;
	const RADIUS = 105;
	/** 点の手前で弧を切る角度。点の円（半径 32px 相当）にかからない程度。 */
	const GAP = 24;

	const steps = [
		{ id: 'safe', icon: 'edit', label: m.landingCycleWrite, angle: -90 },
		{ id: 'loose', icon: 'emoji', label: m.landingCycleConnect, angle: 30 },
		{ id: 'reflect', icon: 'sun', label: m.landingCycleReflect, angle: 150 },
	];

	const point = (angle: number) => {
		const rad = (angle * Math.PI) / 180;
		return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) };
	};
	const arcs = steps.map((step, i) => {
		const next = steps[(i + 1) % steps.length];
		const end = next.angle > step.angle ? next.angle : next.angle + 360;
		const from = point(step.angle + GAP);
		const to = point(end - GAP);
		return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} A ${RADIUS} ${RADIUS} 0 0 1 ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
	});
	const percent = (value: number) => `${((value / SIZE) * 100).toFixed(2)}%`;
</script>

<div class="landing-cycle">
	<svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
		<defs>
			<marker
				id="landing-cycle-arrow"
				viewBox="0 0 10 10"
				refX="6"
				refY="5"
				markerWidth="7"
				markerHeight="7"
				orient="auto-start-reverse"
			>
				<path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="currentColor" stroke-width="1.6" />
			</marker>
		</defs>
		{#each arcs as d, i (i)}
			<path {d} class="landing-cycle-arc" marker-end="url(#landing-cycle-arrow)" />
		{/each}
	</svg>
	<ol class="landing-cycle-steps">
		{#each steps as step, i (step.id)}
			{@const at = point(step.angle)}
			<li style:left={percent(at.x)} style:top={percent(at.y)}>
				<a href={`#landing-${step.id}`}>
					<span class="landing-cycle-dot"><Icon name={step.icon} size={26} /></span>
					<span class="landing-cycle-label"
						><span aria-hidden="true">{i + 1}</span>{step.label()}</span
					>
				</a>
			</li>
		{/each}
	</ol>
	<p class="landing-cycle-center">
		<Icon name="refresh" size={18} />
		<span>{m.landingCycleCenter()}</span>
	</p>
</div>
