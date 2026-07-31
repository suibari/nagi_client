<script lang="ts">
	import './layout.css';
	import SidebarLeft from '$lib/components/shell/SidebarLeft.svelte';
	import SidebarRight from '$lib/components/shell/SidebarRight.svelte';
	import MobileHeader from '$lib/components/shell/MobileHeader.svelte';
	import MobileNav from '$lib/components/shell/MobileNav.svelte';
	import { initOAuth, session, oauthReady } from '$lib/oauth/session.svelte';
	import { initLocale, m } from '$lib/i18n/i18n.svelte';
	import { getOwnNagiProfile } from '$lib/atproto/records';
	import { resolvePendingOptIns } from '$lib/optin/scope-optin';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { startUnreadPolling } from '$lib/notifications/unread.svelte';
	import { startUnreadNewsPolling } from '$lib/news/unread.svelte';
	import PostFollowNotice from '$lib/components/PostFollowNotice.svelte';
	import PostFab from '$lib/components/PostFab.svelte';
	import PostModal from '$lib/components/PostModal.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { defaultScopeForPath } from '$lib/post/scope';
	import { mutes } from '$lib/mute/mutes.svelte';
	import { refreshPushState } from '$lib/notifications/push.svelte';
	import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { postTranslations } from '$lib/i18n/postTranslations.svelte';
	import { privateList } from '$lib/private-list/private-list.svelte';

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
				'全肯定SNS Nagi（ナギ）が選ばれる理由と、はじめかた。全肯定botたんが必ず返信し、いいねもフォローもなく、3000文字のMarkdownで長く書けます。投稿はAT Protocolであなた自身のPDSに残ります。',
			canonical: 'https://nagi.suibari.com/about',
		},
		'/terms': {
			title: 'Nagi 利用規約',
			description:
				'全肯定SNS Nagi（ナギ）の利用規約とコミュニティガイドライン。利用資格、禁止事項、保護される表現、違反への対応、AI機能の取り扱いについて記載しています。',
			canonical: 'https://nagi.suibari.com/terms',
		},
		'/privacy': {
			title: 'Nagi プライバシーポリシー',
			description:
				'全肯定SNS Nagi（ナギ）のプライバシーポリシー。どの情報をあなたのPDSとNagiのサーバのどちらに保存するか、AI機能でGoogleに何を送信するか、削除の方法を記載しています。',
			canonical: 'https://nagi.suibari.com/privacy',
		},
	};

	let { children } = $props();
	const publicSeo = $derived(PUBLIC_SEO[page.url.pathname]);
	const wideLayout = $derived(page.url.pathname === '/about');
	// サインインの動線そのものを塞がないページでは投稿ボタンを出さない。
	const NO_FAB = ['/login', '/onboarding', '/oauth'];
	const showPostFab = $derived(
		!!$session &&
			$oauthReady &&
			!composerHost.open &&
			!NO_FAB.some((path) => page.url.pathname.startsWith(path)),
	);
	const defaultScope = $derived(defaultScopeForPath(page.url.pathname));
	let checkedDid: string | undefined;
	let mutesDid: string | undefined;
	let privateListDid: string | undefined;
	let pushSyncedDid: string | undefined;
	beforeNavigate(() => postTranslations.cancelPending());
	$effect(() => {
		postTranslations.syncPreferences(
			languagePreferences.translationLanguage,
			languagePreferences.autoTranslate,
		);
	});
	// ミュート一覧はサインインごとに1回だけ読み、サインアウトで捨てる。
	$effect(() => {
		const did = $session?.did;
		if (!$oauthReady || mutesDid === did) return;
		mutesDid = did;
		if (did) void mutes.load();
		else mutes.clear();
	});
	// ホームリストは本人だけの非公開状態。サインアウト時は同じtickで破棄し、
	// 次の利用者へ前セッションの一覧を見せない。
	$effect(() => {
		const did = $session?.did;
		if (!$oauthReady || privateListDid === did) return;
		privateListDid = did;
		if (did) void privateList.load();
		else privateList.clear();
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
		void initOAuth().then(() => resolvePendingOptIns());
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
<!-- /about はサービス紹介のランディングなので、右サイドバーを畳んで本文を広く取る。 -->
<div class="shell" class:wide={wideLayout}>
	<SidebarLeft />
	<main>{@render children()}</main>
	{#if !wideLayout}<SidebarRight />{/if}
</div>
<MobileNav />
<PostFollowNotice />
<!-- 投稿はページごとではなくアプリ全体の1つの入口に統一する。Composer は
     PostModal の中で常時マウントしたままにする（添付画像を失わないため）。 -->
{#if showPostFab}
	<PostFab onclick={() => composerHost.show(defaultScope)} />
{/if}
{#if $session}
	<PostModal />
{/if}
