<script lang="ts">
	import { onMount } from 'svelte';
	import { getPositiveNews } from '$lib/api/appview';
	import type { NewsView } from '$lib/api/types';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import NewsSidebarContent from '$lib/news/NewsSidebarContent.svelte';
	import { pickSidebarNews } from '$lib/news/selection';
	import { openNewsUnreadView } from '$lib/news/unread.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import RadioContent from '$lib/radio/RadioContent.svelte';
	import { radio } from '$lib/radio/radio.svelte';

	/**
	 * 右サイドバーの botたん枠。botたんラジオと botたんニュースのうち新しい方を1つだけ出す。
	 * ラジオはレイアウトが取得済み（サインイン時のみ）なので、ここではニュースだけ取る。
	 */

	// 右サイドバーは 1180px 未満で CSS により消える（shell.css）。見えない幅では取得しない。
	const WIDE = '(min-width: 1180px)';
	// ニュースは1日最大4回の公開なので、頻繁に取り直す必要はない。
	const NEWS_POLL_MS = 10 * 60_000;

	let wide = $state(false);
	let news = $state<NewsView>();
	let request = 0;

	async function loadNews() {
		if (!wide || !$oauthReady) return;
		const id = ++request;
		const did = $session?.did;
		try {
			const page = await getPositiveNews(i18n.locale);
			if (id !== request) return;
			// 既読は進めない（ここで進めると /news の未読が見ないうちに消える）。順位づけにだけ使う。
			news = pickSidebarNews(page, openNewsUnreadView(did));
		} catch {
			// 取れなかったときはラジオだけ（あれば）出す。次のポーリングで取り直す。
		}
	}

	// アカウント・言語が変わったら取り直す。
	$effect(() => {
		void $session?.did;
		void i18n.locale;
		if (!wide || !$oauthReady) return;
		news = undefined;
		void loadNews();
	});

	onMount(() => {
		const query = matchMedia(WIDE);
		wide = query.matches;
		const onChange = () => (wide = query.matches);
		query.addEventListener('change', onChange);
		const stop = startVisiblePolling(() => void loadNews(), NEWS_POLL_MS, { onReturn: true });
		return () => {
			query.removeEventListener('change', onChange);
			stop();
		};
	});

	const time = (value: string | undefined) => (value ? Date.parse(value) || 0 : 0);
	/** 新しい方。同時刻ならラジオ（サインイン中だけ届く、本人向けの枠なので優先する）。 */
	const showNews = $derived(
		Boolean(news) && time(news?.createdAt) > time(radio.track?.publishedAt),
	);
</script>

{#if showNews && news}
	<NewsSidebarContent {news} />
{:else if radio.track}
	<RadioContent track={radio.track} />
{/if}
