<script lang="ts">
	/** 配置は固定し、開くたびに画面全体へ均等に出るようにする。 */
	const colors = ['#ff5c7a', '#ffb43b', '#ffe066', '#55c98a', '#58a8ff', '#9b74e8', '#ef73c8'];
	const balloons = Array.from({ length: 30 }, (_, index) => ({
		left: (index * 37 + 7) % 101,
		top: (index * 53 + 4) % 92,
		delay: -((index * 0.43) % 8),
		duration: 8.5 + ((index * 17) % 40) / 10,
		drift: ((index * 29) % 81) - 40,
		driftEnd: Math.round((((index * 29) % 81) - 40) * -0.45),
		size: 0.78 + ((index * 13) % 45) / 100,
		color: colors[index % colors.length],
	}));
</script>

<div class="birthday-balloons" aria-hidden="true">
	{#each balloons as balloon, index (index)}
		<span
			class="balloon"
			style={`--left:${balloon.left}%;--top:${balloon.top}%;--delay:${balloon.delay}s;--duration:${balloon.duration}s;--drift:${balloon.drift}px;--drift-end:${balloon.driftEnd}px;--scale:${balloon.size};--balloon-color:${balloon.color}`}
		>
			<span class="string"></span>
		</span>
	{/each}
</div>

<style>
	.birthday-balloons {
		position: fixed;
		inset: 0;
		z-index: 80;
		overflow: hidden;
		pointer-events: none;
		contain: strict;
	}
	.balloon {
		position: absolute;
		inset-inline-start: var(--left);
		inset-block-end: -24vh;
		inline-size: clamp(36px, 6.5vw, 74px);
		aspect-ratio: 0.82;
		border-radius: 52% 52% 48% 48%;
		background:
			radial-gradient(circle at 30% 24%, rgb(255 255 255 / 0.72) 0 7%, transparent 8%),
			linear-gradient(
				145deg,
				color-mix(in srgb, var(--balloon-color) 75%, white),
				var(--balloon-color)
			);
		box-shadow:
			inset -0.3rem -0.45rem 0.7rem rgb(0 0 0 / 0.13),
			0 0.25rem 0.7rem rgb(0 0 0 / 0.14);
		transform: translateX(-50%) scale(var(--scale));
		animation: rise var(--duration) var(--delay) linear infinite;
	}
	.balloon::after {
		content: '';
		position: absolute;
		inset-inline-start: 50%;
		inset-block-end: -0.42rem;
		inline-size: 0;
		block-size: 0;
		border-inline: 0.3rem solid transparent;
		border-block-end: 0.48rem solid var(--balloon-color);
		transform: translateX(-50%);
	}
	.string {
		position: absolute;
		inset-inline-start: 50%;
		inset-block-start: calc(100% + 0.35rem);
		inline-size: 1px;
		block-size: clamp(34px, 8vh, 72px);
		background: rgb(80 70 70 / 0.46);
		transform: rotate(4deg);
		transform-origin: top;
	}
	@keyframes rise {
		0% {
			translate: 0 0;
			rotate: -4deg;
		}
		50% {
			translate: var(--drift) -70vh;
			rotate: 5deg;
		}
		100% {
			translate: var(--drift-end) -145vh;
			rotate: -3deg;
		}
	}
	@media (max-width: 480px) {
		.balloon {
			inline-size: clamp(32px, 12vw, 58px);
		}
		.balloon:nth-child(n + 25) {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.balloon {
			inset-block-end: auto;
			inset-block-start: var(--top);
			animation: none;
			opacity: 0.72;
		}
	}
</style>
