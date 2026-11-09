<script lang="ts" module>
	/**
	 * 水面から上がってくる泡（/about のヒーロー、参加の締め）。位置は面に対する割合で、
	 * 文字の上にかからない場所に置く。wide は2列のときだけ出す泡（1列に積むと文字の裏に入る位置）。
	 */
	export type Bubble = {
		size: number;
		ring?: boolean;
		wide?: boolean;
		x: string;
		y: string;
		side: 'start' | 'end';
	};
</script>

<script lang="ts">
	let { list }: { list: Bubble[] } = $props();
</script>

<div class="about-bubbles" aria-hidden="true">
	{#each list as bubble, i (i)}
		<span
			class="about-bubble"
			class:is-ring={bubble.ring}
			class:is-wide={bubble.wide}
			style:--bubble-size={`${bubble.size}px`}
			style:--bubble-index={i}
			style:inset-inline-start={bubble.side === 'start' ? bubble.x : undefined}
			style:inset-inline-end={bubble.side === 'end' ? bubble.x : undefined}
			style:inset-block-start={bubble.y}
		></span>
	{/each}
</div>
