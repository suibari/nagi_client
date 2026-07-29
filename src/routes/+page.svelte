<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { drawCard, getTimeline } from '$lib/api/appview';
	import type { CardView, DrawCardResult } from '$lib/api/types';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { Feed } from '$lib/feed/feed.svelte';
	import { postFollowNotice } from '$lib/feed/post-follow.svelte';
	import { globalFeedRead } from '$lib/feed/unread.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Composer from '$lib/components/Composer.svelte';
	import CardDrawFab from '$lib/components/CardDrawFab.svelte';
	import CardDetailDialog from '$lib/components/CardDetailDialog.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	// こっそりポストは共有TLに載せない。楽観表示でも一瞬たりとも出さない。
	const feed = new Feed(
		(cursor) => getTimeline(cursor),
		(item) => !item.threadKossori,
		globalFeedRead,
	);
	let lastDid = $state<string | undefined>(undefined);

	// --- 全肯定カードの導線 -------------------------------------------------
	// 図鑑（プロフィールのカードタブ）まで辿り着けない人がほとんどなので、その日まだ
	// 引いていないときだけ TL の右下にカードの裏面を出し、ここから直接引けるようにする。
	let drawing = $state(false);
	let drawError = $state('');
	let drawResult = $state<DrawCardResult | undefined>();
	let openedCard = $state<CardView | undefined>();
	const myDid = $derived($oauthReady ? $session?.did : undefined);
	// 開発時にドロー済みでも見た目を確認できるようにする逃げ道。dev はビルド時に
	// false へ畳まれるので、本番ではこの分岐ごと消える。クエリ名は打ち間違えやすいので
	// 大文字小文字を問わない（cardfab / cardFab のどちらでも効く）。未ログインでも出す
	// ——見た目の確認が目的で、押しても drawFromFab が何もしないだけ。
	const forceFab = $derived(
		dev && [...page.url.searchParams].some(([k, v]) => k.toLowerCase() === 'cardfab' && v === '1'),
	);
	// drawStatus が取れるまでは出さない（fail closed）。「出てから消える」より
	// 「少し遅れて出る」ほうがましなので、canDrawToday は === true 判定にしてある。
	const showFab = $derived(!openedCard && ((!!myDid && cardCollections.canDrawToday) || forceFab));
	$effect(() => {
		if (myDid) void cardCollections.ensure(myDid);
	});

	onMount(() => {
		feed.load();
		// base refresh + fast poll while own recent posts wait for botたん's reply
		const base = startVisiblePolling(() => feed.refresh(), 30_000, { onReturn: true });
		const fast = startVisiblePolling(() => feed.refresh(), 3_000, {
			when: () => feed.hasOptimistic() || feed.hasPendingFor($session?.did),
		});
		// 別タブで引いた場合と、JST 4:00 の境界をまたいで戻ってきた場合だけ取り直す。
		const cards = startVisiblePolling(() => cardCollections.refreshSelfIfStale(), 5 * 60_000, {
			onReturn: true,
		});
		return () => {
			base();
			fast();
			cards();
		};
	});

	async function drawFromFab() {
		const did = myDid;
		if (!did || drawing) return;
		drawing = true;
		drawError = '';
		try {
			const result = await drawCard();
			// 成功した時点で drawStatus を落とす。閉じるまで待つとダイアログの背面で FAB が
			// 生き残り、二重ドローを誘発する（サーバーは冪等だが UI としては混乱する）。
			cardCollections.applyDraw(did, result);
			// alreadyDrawn（別タブが先に引いた）も同じ扱いでよい。返ってくるのはその日の
			// カードで、ダイアログが cardDrawAlreadyTitle を出してくれる。
			drawResult = result;
			openedCard = result.card;
		} catch (e) {
			drawError = e instanceof Error ? e.message : m.cardDrawFailed();
		} finally {
			drawing = false;
		}
	}

	function closeDraw(final: CardView) {
		openedCard = undefined;
		drawResult = undefined;
		// botたんのひとことが届いていれば図鑑側へ書き戻す（カードタブで即読める）。
		if (myDid) cardCollections.applyCard(myDid, final);
	}
	$effect(() => {
		if ($oauthReady) {
			const did = $session?.did;
			if (did !== lastDid) {
				lastDid = did;
				feed.load();
			}
		}
	});
</script>

<FeedTabs />
{#if $session}
	<Composer onposted={() => feed.refresh()} />
{:else if $oauthReady}
	<section class="hero">
		<p class="eyebrow">{m.heroEyebrow()}</p>
		<h1>{m.heroTitle()}</h1>
		<p>{m.heroBody()}</p>
	</section>
	<aside class="welcome">
		<div>
			<strong>{m.welcomeTitle()}</strong><span>{m.welcomeBody()}</span>
			<a class="welcome-about" href="/about">{m.welcomeAboutLink()} →</a>
		</div>
		<a href="/login">{m.joinCta()}</a>
	</aside>
{/if}
<section class="timeline" aria-busy={feed.loading}>
	{#if feed.loading && !feed.visibleItems.length}<div
			class="timeline-loading"
			role="status"
			aria-label={m.feedWaiting()}
		>
			<span class="spinner" aria-hidden="true"></span>
		</div>
	{:else if feed.error && !feed.visibleItems.length}<div class="state error">
			{feed.error}<button
				class="icon-action"
				type="button"
				aria-label={m.retry()}
				title={m.retry()}
				onclick={() => feed.load()}><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !feed.visibleItems.length}<div class="state">
			{m.feedEmpty()}
		</div>
	{:else}{#each feed.visibleItems as item (item.conversation?.threadRootUri ?? item.uri)}<ThreadUnit
				{item}
				unread={feed.isUnread(item, $session?.did)}
				botActor={feed.botActor}
				ondeleted={(uri) => feed.removePost(uri)}
				onposted={() => feed.refresh()}
			/>{/each}<InfiniteScroll
			hasMore={feed.hasMore}
			loading={feed.loading}
			error={feed.error}
			onload={() => feed.loadMore()}
		/>{/if}
</section>

{#if showFab || drawing || drawError}
	<CardDrawFab
		{drawing}
		error={drawError}
		shifted={!!postFollowNotice.current}
		ondraw={drawFromFab}
		ondismisserror={() => (drawError = '')}
	/>
{/if}
{#if openedCard && myDid}
	<CardDetailDialog
		initial={openedCard}
		actor={myDid}
		draw={drawResult}
		collectionHref={`/profile/${myDid}?tab=cards`}
		onclose={closeDraw}
	/>
{/if}
