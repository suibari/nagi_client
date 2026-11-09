<script lang="ts">
	/**
	 * 参加の締め（「はじめてみませんか」）。/about とランディングの末尾で同じものを使う。
	 * 泡の面に botたんを置き、「Nagiをはじめる」に触れると喜び、押すと一度跳ねてから登録へ進む。
	 * 愛着を持ってもらう最初の一歩。待たせすぎると「もたついた」になるので遷移は 0.5 秒だけ遅らせ、
	 * 新しいタブで開く操作と演出を切っている人はすぐ進める。
	 *
	 * 2つ目のリンクだけ置き場所で変える（/about はログイン、ランディングは /about）。
	 * サインイン前にだけ意味があるので、出し分けは呼び出し側が持つ。
	 */
	import Bubbles, { type Bubble } from './Bubbles.svelte';
	import Button from './Button.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let {
		secondary = { href: '/login', label: m.loginSubmit },
	}: { secondary?: { href: string; label: () => string } } = $props();

	// 中央の botたんの左右に置く。
	const bubbles: Bubble[] = [
		{ size: 40, wide: true, x: '12%', y: '58%', side: 'start' },
		{ size: 16, ring: true, x: '22%', y: '22%', side: 'start' },
		{ size: 28, x: '14%', y: '30%', side: 'end' },
		{ size: 12, ring: true, x: '24%', y: '70%', side: 'end' },
	];

	const JOIN_HOP_MS = 500;
	let botHappy = $state(false);
	let botHopping = $state(false);
	let joinTimer: ReturnType<typeof setTimeout> | undefined;
	function onJoinClick(event: MouseEvent) {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
			return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		event.preventDefault();
		const href = (event.currentTarget as HTMLAnchorElement).href;
		botHappy = true;
		botHopping = true;
		clearTimeout(joinTimer);
		joinTimer = setTimeout(() => goto(href), JOIN_HOP_MS);
	}
	function onJoinLeave() {
		if (!botHopping) botHappy = false;
	}
	// ブラウザの「戻る」でキャッシュから戻ったときは、座った姿からやり直す。
	function onPageShow(event: PageTransitionEvent) {
		if (!event.persisted) return;
		clearTimeout(joinTimer);
		botHappy = false;
		botHopping = false;
	}
	onMount(() => () => clearTimeout(joinTimer));
</script>

<svelte:window onpageshow={onPageShow} />

<section class="about-final">
	<Bubbles list={bubbles} />
	<!-- 2枚とも読み込んでおき、重ねて切り替える。喜ぶ瞬間に画像の読み込みを待たせない。 -->
	<div class="about-final-bot" class:is-happy={botHappy} class:is-hopping={botHopping}>
		<img src="/bot_assist_sitting.png" alt={m.heroSampleBotName()} width="264" height="350" />
		<img src="/bot_assist_petted.png" alt="" width="264" height="350" aria-hidden="true" />
	</div>
	<h2>{m.aboutFinalHeading()}</h2>
	<p>{m.aboutFinalBody()}</p>
	<p>{m.loginSignupBody()}</p>
	<div class="about-cta">
		<Button
			variant="primary"
			size="lg"
			href="/login#signup"
			onclick={onJoinClick}
			onmouseenter={() => (botHappy = true)}
			onmouseleave={onJoinLeave}
			onfocus={() => (botHappy = true)}
			onblur={onJoinLeave}>{m.loginSignupSubmit()}</Button
		>
		<a class="about-text-link" href={secondary.href}>{secondary.label()}</a>
	</div>
</section>
