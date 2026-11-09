<script lang="ts">
	/**
	 * 3本柱が「書く → つながる → 振り返る → また書く」と循環していることを見せる輪。
	 * 輪の上の3点は下の各柱へのリンクで、中央に「また書きたくなる」を置く。
	 * 矢印は時計回りの円弧で、点の手前で切って重ならないようにする。装飾なので読み上げからは外し、
	 * 意味はリンクの並び（1 → 2 → 3）と中央の文で伝える。
	 *
	 * 普段は落ち着いた無彩色にしておき、カーソルを当てた（フォーカスした）点と、そこから次へ
	 * 向かう矢印だけをじわっとアクセント色にする。「振り返る」では「書く」へ戻る矢印と中央の文も
	 * 灯り、輪が閉じることを見せる。矢印の先端は marker だと色の遷移に乗らないので、
	 * 弧と同じグループに自前の山形を描き、グループの色ごと切り替える。
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
	const LAST = steps.length - 1;

	const point = (angle: number) => {
		const rad = (angle * Math.PI) / 180;
		return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) };
	};
	const arcs = steps.map((step, i) => {
		const next = steps[(i + 1) % steps.length];
		const endAngle = (next.angle > step.angle ? next.angle : next.angle + 360) - GAP;
		const from = point(step.angle + GAP);
		const to = point(endAngle);
		return {
			d: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} A ${RADIUS} ${RADIUS} 0 0 1 ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
			// 時計回りの接線方向（角度 + 90°）へ向けた山形を、弧の終点に置く。
			head: `translate(${to.x.toFixed(1)} ${to.y.toFixed(1)}) rotate(${(endAngle + 90).toFixed(1)})`,
		};
	});
	const percent = (value: number) => `${((value / SIZE) * 100).toFixed(2)}%`;

	let active = $state<number>();
	const enter = (i: number) => (active = i);
	const leave = (i: number) => {
		if (active === i) active = undefined;
	};
</script>

<div class="landing-cycle">
	<svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
		{#each arcs as arc, i (i)}
			<g class="landing-cycle-arc" class:is-active={active === i}>
				<path d={arc.d} />
				<path d="M -7 -5 L 0 0 L -7 5" transform={arc.head} />
			</g>
		{/each}
	</svg>
	<ol class="landing-cycle-steps">
		{#each steps as step, i (step.id)}
			{@const at = point(step.angle)}
			<li style:left={percent(at.x)} style:top={percent(at.y)} class:is-active={active === i}>
				<a
					href={`#landing-${step.id}`}
					onmouseenter={() => enter(i)}
					onmouseleave={() => leave(i)}
					onfocus={() => enter(i)}
					onblur={() => leave(i)}
				>
					<span class="landing-cycle-dot"><Icon name={step.icon} size={26} /></span>
					<span class="landing-cycle-label"
						><span aria-hidden="true">{i + 1}</span>{step.label()}</span
					>
				</a>
			</li>
		{/each}
	</ol>
	<p class="landing-cycle-center" class:is-active={active === LAST}>
		<Icon name="refresh" size={18} />
		<span>{m.landingCycleCenter()}</span>
	</p>
</div>
