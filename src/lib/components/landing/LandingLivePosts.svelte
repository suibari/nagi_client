<script lang="ts">
	/**
	 * ランディングの「いまのNagi」。公開タイムラインの実投稿を数件だけ、読むための形で並べる。
	 * 選び方は showcase-posts.ts（伏せる必要のある投稿は出さない）。
	 *
	 * 実物の ThreadUnit はリアクション・返信・メニューなどサインイン前提の操作を持つので、
	 * ここでは本文・画像・botたんの返信・絵文字だけを描く。絵文字は押せるが演出だけで、
	 * どこにも記録しない（DemoReactionButton）。届いた絵文字の数は出さない。
	 *
	 * 中身は今この瞬間のタイムラインなので、プリレンダには含めずクライアントで取る。
	 * 取れるまでは高さだけ確保して、下のブロックがガタつかないようにする。
	 */
	import type { ActorView } from '$lib/api/types';
	import { getTimeline } from '$lib/api/appview';
	import { postPageHref } from '$lib/feed/post-follow.svelte';
	import { pickShowcasePosts, type ShowcasePost } from '$lib/landing/showcase-posts';
	import { m } from '$lib/i18n/i18n.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import ImageGallery from '$lib/components/ImageGallery.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import DemoReactionButton from '$lib/components/DemoReactionButton.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { onMount } from 'svelte';

	const LIMIT = 4;
	/** 広い画面は2列なので、偶数件にそろえて右下を空けない（4件か2件。1件しかなければ1件）。 */
	const fitColumns = <T,>(items: T[]) =>
		items.length > 1 ? items.slice(0, items.length - (items.length % 2)) : items;

	let status = $state<'loading' | 'ready' | 'empty'>('loading');
	let posts = $state<ShowcasePost[]>([]);
	let botActor = $state<ActorView>();

	onMount(() => {
		let cancelled = false;
		getTimeline()
			.then((page) => {
				if (cancelled) return;
				posts = fitColumns(pickShowcasePosts(page.items, LIMIT));
				botActor = page.botActor;
				status = posts.length ? 'ready' : 'empty';
			})
			.catch((error) => {
				if (cancelled) return;
				console.warn('Failed to load landing posts:', error);
				status = 'empty';
			});
		return () => {
			cancelled = true;
		};
	});

	const nameOf = (actor: ActorView) => actor.displayName || actor.handle;
</script>

<div class="landing-live" aria-label={m.landingLiveAria()} aria-busy={status === 'loading'}>
	{#if status === 'loading'}
		{#each { length: 2 } as _, i (i)}
			<div class="landing-post is-skeleton" aria-hidden="true"></div>
		{/each}
	{:else if status === 'empty'}
		<p class="landing-live-empty">{m.landingLiveEmpty()}</p>
	{:else}
		{#each posts as { post, botReply } (post.uri)}
			<article class="landing-post">
				<header class="landing-post-head">
					<Avatar actor={post.author} />
					<a class="landing-post-name" href={postPageHref(post)}>{nameOf(post.author)}</a>
				</header>
				<div class="landing-post-text">
					<RichText text={post.text} facets={post.facets} />
				</div>
				{#if post.images?.length}
					<ImageGallery images={post.images} clampTall />
				{:else if post.video}
					<VideoPlayer video={post.video} />
				{/if}
				{#if post.reactions.length}
					<div class="landing-post-reactions">
						{#each post.reactions as reaction (reaction.bluemoji?.uri ?? reaction.emoji)}
							<DemoReactionButton
								class="reaction-emoji"
								emoji={reaction.emoji}
								bluemoji={reaction.bluemoji}
							/>
						{/each}
					</div>
				{/if}
				<div class="landing-post-reply">
					<span class="landing-post-bot" aria-hidden="true">
						{#if botActor?.avatar}<Avatar actor={botActor} size="small" />{:else}<Icon
								name="bot"
								size={18}
							/>{/if}
					</span>
					<div>
						<strong>{botActor ? nameOf(botActor) : m.heroSampleBotName()}</strong>
						<div class="landing-post-reply-text">
							<RichText text={botReply.text} facets={botReply.facets} />
						</div>
					</div>
				</div>
			</article>
		{/each}
	{/if}
</div>
