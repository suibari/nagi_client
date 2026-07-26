<script lang="ts">
	import './layout.css';
	import SidebarLeft from '$lib/components/shell/SidebarLeft.svelte';
	import SidebarRight from '$lib/components/shell/SidebarRight.svelte';
	import MobileHeader from '$lib/components/shell/MobileHeader.svelte';
	import MobileNav from '$lib/components/shell/MobileNav.svelte';
	import { initOAuth, session, oauthReady } from '$lib/oauth/session.svelte';
	import { initLocale, m } from '$lib/i18n/i18n.svelte';
	import { getOwnNagiProfile } from '$lib/atproto/records';
	import { resolveCrosspostPending } from '$lib/crosspost/preferences';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { startUnreadPolling } from '$lib/notifications/unread.svelte';
	import { startUnreadNewsPolling } from '$lib/news/unread.svelte';
	import PostFollowNotice from '$lib/components/PostFollowNotice.svelte';
	import { mutes } from '$lib/mute/mutes.svelte';
	import { refreshPushState } from '$lib/notifications/push.svelte';

	const PUBLIC_SEO: Record<string, { title: string; description: string; canonical: string }> = {
		'/': {
			title: 'Nagi（ナギ）— やさしい言葉が凪ぐ全肯定SNS',
			description:
				'Nagi（ナギ）は、全肯定botたんが言葉を受け止める、AT Protocol上の全肯定SNSです。いいねやフォローを気にせず、自由に気持ちを投稿できます。',
			canonical: 'https://nagi.suibari.com/',
		},
		'/about': {
			title: 'Nagiについて — 全肯定SNS Nagi（ナギ）',
			description:
				'全肯定SNS Nagi（ナギ）の特徴と使い方。全肯定botたん、いいね・フォローのないタイムライン、AT Protocolによるデータ管理について紹介します。',
			canonical: 'https://nagi.suibari.com/about',
		},
		'/terms': {
			title: 'Nagi 利用規約',
			description: '全肯定SNS Nagi（ナギ）の利用規約です。',
			canonical: 'https://nagi.suibari.com/terms',
		},
		'/privacy': {
			title: 'Nagi プライバシーポリシー',
			description: '全肯定SNS Nagi（ナギ）のプライバシーポリシーです。',
			canonical: 'https://nagi.suibari.com/privacy',
		},
	};

	let { children } = $props();
	const publicSeo = $derived(PUBLIC_SEO[page.url.pathname]);
	let checkedDid: string | undefined;
	let mutesDid: string | undefined;
	let pushSyncedDid: string | undefined;
	// ミュート一覧はサインインごとに1回だけ読み、サインアウトで捨てる。
	$effect(() => {
		const did = $session?.did;
		if (!$oauthReady || mutesDid === did) return;
		mutesDid = did;
		if (did) void mutes.load();
		else mutes.clear();
	});
	// プッシュ購読の状態同期。ブラウザ側の PushSubscription と AppView 側の購読行という
	// 2つの真実を突き合わせる処理なので、特定のページではなくセッション確立に紐付ける。
	// 以前これを /settings/notifications の $effect に置いていたため、そのページを開くまで
	// 「端末は購読済みだがサーバーに行が無い」不整合が直らず、通知が届かない端末を
	// ユーザーが自力で見つけられなかった。ここに置くことで起動のたびに自己修復される。
	// refreshPushState() は非対応環境と多重実行を自分でガードするので呼び放しでよい。
	$effect(() => {
		const did = $oauthReady ? $session?.did : undefined;
		if (!did || pushSyncedDid === did) return;
		pushSyncedDid = did;
		void refreshPushState();
	});
	onMount(() => {
		// プリレンダリングは日本語で固定し、hydration 完了後に端末の言語設定へ追従する。
		initLocale();
		// 再サインイン（クロスポスト権限の追加同意）から戻ってきた場合の確定処理。
		void initOAuth().then(() => resolveCrosspostPending());
		// 未読通知バッジのポーリング開始（session の変化には内部で追従する）。
		startUnreadPolling();
		// 公開ニュースの新着有無を端末内の既読基準と照合する。
		startUnreadNewsPolling();
	});
	$effect(() => {
		const did = $session?.did;
		if (!$oauthReady || !did || checkedDid === did) return;
		checkedDid = did;
		void getOwnNagiProfile()
			.then((profile) => {
				if (!profile && page.url.pathname !== '/settings/profile')
					void goto('/settings/profile?onboarding=1');
			})
			.catch((error) => {
				checkedDid = undefined;
				console.error('Failed to check Nagi profile:', error);
			});
	});
</script>

<svelte:head>
	<title>{publicSeo?.title ?? m.appTitle()}</title>
	<meta name="description" content={publicSeo?.description ?? m.appDescription()} />
	<meta name="robots" content={publicSeo ? 'index,follow' : 'noindex,follow'} />
	<meta property="og:title" content={publicSeo?.title ?? m.appTitle()} />
	<meta property="og:description" content={publicSeo?.description ?? m.appDescription()} />
	<meta
		property="og:url"
		content={publicSeo?.canonical ?? `https://nagi.suibari.com${page.url.pathname}`}
	/>
	<meta name="twitter:title" content={publicSeo?.title ?? m.appTitle()} />
	<meta name="twitter:description" content={publicSeo?.description ?? m.appDescription()} />
	{#if publicSeo}<link rel="canonical" href={publicSeo.canonical} />{/if}
</svelte:head>

<MobileHeader />
<div class="shell">
	<SidebarLeft />
	<main>{@render children()}</main>
	<SidebarRight />
</div>
<MobileNav />
<PostFollowNotice />
