<script lang="ts">
	import './layout.css';
	import SidebarLeft from '$lib/components/shell/SidebarLeft.svelte';
	import SidebarRight from '$lib/components/shell/SidebarRight.svelte';
	import MobileHeader from '$lib/components/shell/MobileHeader.svelte';
	import MobileNav from '$lib/components/shell/MobileNav.svelte';
	import { initOAuth, session, oauthReady } from '$lib/oauth/session.svelte';
	import { initLocale, m, i18n } from '$lib/i18n/i18n.svelte';
	import { getOwnNagiProfile } from '$lib/atproto/records';
	import { resolvePendingOptIns } from '$lib/optin/scope-optin';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { startUnreadPolling } from '$lib/notifications/unread.svelte';
	import { interceptSiblingLinkClick } from '$lib/sso/links';
	import PostFollowNotice from '$lib/components/PostFollowNotice.svelte';
	import { postFollow } from '$lib/feed/post-follow.svelte';
	import PostFab from '$lib/components/PostFab.svelte';
	import PostModal from '$lib/components/PostModal.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { defaultScopeForPath } from '$lib/post/scope';
	import { mutes } from '$lib/mute/mutes.svelte';
	import { refreshPushState, refreshPushWithCapability } from '$lib/notifications/push.svelte';
	import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { postTranslations } from '$lib/i18n/postTranslations.svelte';
	import { privateList } from '$lib/private-list/private-list.svelte';
	import { loadReactionUsage, prepareReactionPalette } from '$lib/emoji/reactionUsage';
	import { loadFavorites, saveFavorites } from '$lib/emoji/favorites';
	import { preferencesReady, syncPreferences } from '$lib/preferences/sync.svelte';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import ReactionCardRewardHost from '$lib/components/ReactionCardRewardHost.svelte';
	import AnniversaryCardHost from '$lib/components/AnniversaryCardHost.svelte';
	import { bookmarks } from '$lib/bookmarks/bookmarks.svelte';
	import GuestPostModal from '$lib/components/GuestPostModal.svelte';
	import { guestComposerHost } from '$lib/guest-posts/composer-host.svelte';
	import { guestPosts } from '$lib/guest-posts/guest-posts.svelte';
	import { guestCardDraw } from '$lib/cards/guest-draw.svelte';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { startChronicleNotice } from '$lib/chronicle/notice';
	import { startZenkatsuNotice } from '$lib/zenkatsu/notice';
	import { startRadioNotice } from '$lib/radio/radio.svelte';

	let { children } = $props();
	const seo = $derived(page.data.seo);
	// サインインの動線そのものを塞がないページでは投稿ボタンを出さない。
	const NO_FAB = ['/login', '/onboarding', '/oauth'];
	const showPostFab = $derived(
		$oauthReady &&
			!composerHost.open &&
			!guestComposerHost.open &&
			!NO_FAB.some((path) => page.url.pathname.startsWith(path)),
	);
	const defaultScope = $derived(defaultScopeForPath(page.url.pathname));
	// 紹介ページは、機能の見本を横に並べて見せたいので右レールを畳んで本文を広げる。
	// 左のナビは残す（ログイン後に設定から来た人の帰り道になる）。
	const wideMain = $derived(page.url.pathname === '/about');
	let checkedDid: string | undefined;
	let mutesDid: string | undefined;
	let privateListDid: string | undefined;
	let bookmarksKey: string | undefined;
	let pushSyncedDid: string | undefined;
	let preferencesDid: string | undefined;
	let guestCardClaimKey: string | undefined;
	beforeNavigate(() => {
		postTranslations.cancelPending();
		// 画面を移ったら投稿の追従は打ち切る。移った先で急に画面が動くほうが戸惑う。
		postFollow.cancel();
	});
	$effect(() => {
		postTranslations.syncPreferences(
			languagePreferences.translationLanguage,
			languagePreferences.autoTranslate,
		);
	});
	// 未サインイン中に引いた当日カードは、OAuth復元後ただちに同日の通常枠へ移す。
	// 成功するまで端末側を消さないので、通信失敗でカードが失われることはない。
	$effect(() => {
		const did = $oauthReady ? $session?.did : undefined;
		const pending = guestCardDraw.result;
		if (!did || !guestCardDraw.ready || !pending) return;
		const key = `${did}:${pending.expiresAt}`;
		if (guestCardClaimKey === key) return;
		guestCardClaimKey = key;
		void guestCardDraw
			.claim()
			.then((result) => {
				if (!result) return;
				cardCollections.applyDraw(did, result);
				void cardCollections.refresh(did);
			})
			.catch((error) => console.error('Failed to claim guest card:', error));
	});
	// ミュート一覧はサインインごとに1回だけ読み、サインアウトで捨てる。
	$effect(() => {
		const did = $session?.did;
		if (!$oauthReady || mutesDid === did) return;
		mutesDid = did;
		if (did) void mutes.load();
		else mutes.clear();
	});
	$effect(() => {
		const did = $session?.did;
		const key = did ? `${did}:${i18n.locale}` : undefined;
		if (!$oauthReady || bookmarksKey === key) return;
		bookmarksKey = key;
		if (did) void bookmarks.load(did, i18n.locale);
		else bookmarks.clear();
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
	// 端末をまたぐ設定（既読位置・お気に入り絵文字・コンテンツ表示など）の同期。ミュートや
	// ホームリストと同じくセッション確立に紐付ける。同期できない端末（permission-set が
	// 古い等）では静かに localStorage 単独へ落ちるので、結果を待つ必要はない。
	$effect(() => {
		const did = $oauthReady ? $session?.did : undefined;
		if (preferencesDid === did) return;
		preferencesDid = did;
		void syncPreferences(did);
	});
	// よく使われるリアクションパレットは、本文表示を妨げないアイドル時間に準備する。
	// ローカル候補だけでも即時表示できるため、失敗時は次回オープン時の再試行に任せる。
	$effect(() => {
		const did = $oauthReady ? $session?.did : undefined;
		if (!did || typeof window === 'undefined') return;
		let cancelled = false;
		const prepare = () => {
			if (cancelled) return;
			// 同期の完了を待ってから読む。先に読むと、初回同期の和集合を
			// この保存で上書きしてしまう。
			void preferencesReady()
				.then(async () => {
					if (cancelled) return;
					const usage = loadReactionUsage();
					const favorites = loadFavorites();
					const prepared = await prepareReactionPalette(did, usage, favorites);
					if (!cancelled) saveFavorites(prepared.favorites);
				})
				.catch(() => undefined);
		};
		if ('requestIdleCallback' in window) {
			const idleId = window.requestIdleCallback(prepare, { timeout: 1_500 });
			return () => {
				cancelled = true;
				window.cancelIdleCallback(idleId);
			};
		}
		const timerId = globalThis.setTimeout(prepare, 500);
		return () => {
			cancelled = true;
			globalThis.clearTimeout(timerId);
		};
	});
	onMount(() => {
		const stopRadioNotice = startRadioNotice();
		const stopZenkatsuNotice = startZenkatsuNotice();
		const stopChronicleNotice = startChronicleNotice();
		// プリレンダリングは日本語で固定し、hydration 完了後に端末の言語設定へ追従する。
		initLocale();
		// フィードのタブ構成を localStorage から読む。プリレンダでは既定タブのままなので、
		// ここで一度読まないと、サインインしない人のカスタムが永久に反映されない
		// （サインイン後は syncPreferences が DID スコープで読み直す）。
		feedTabs.hydrate();
		guestCardDraw.hydrate();
		// 再サインイン（クロスポスト権限の追加同意）から戻ってきた場合の確定処理。
		void initOAuth().then(() => resolvePendingOptIns());
		void guestPosts.load();
		// 未読通知バッジのポーリング開始（session の変化には内部で追従する）。
		startUnreadPolling();
		// 長時間開いたPC、スリープ復帰、オフライン復帰でもPush endpointを自己修復する。
		// capability経路ならOAuth refreshが一時的に失敗していても同じinstallationだけ更新できる。
		const repairPush = () => {
			if (!$session || document.visibilityState !== 'visible' || !navigator.onLine) return;
			void refreshPushWithCapability()
				.then((repaired) => (repaired ? undefined : refreshPushState()))
				.catch(() => refreshPushState());
		};
		const onVisibility = () => repairPush();
		window.addEventListener('online', repairPush);
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			stopRadioNotice();
			stopZenkatsuNotice();
			stopChronicleNotice();
			window.removeEventListener('online', repairPush);
			document.removeEventListener('visibilitychange', onVisibility);
		};
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
	<title>{seo?.title ?? m.appTitle()}</title>
	<meta name="description" content={seo?.description ?? m.appDescription()} />
	<meta name="robots" content={seo ? (seo.robots ?? 'index,follow') : 'noindex,follow'} />
	<meta property="og:title" content={seo?.title ?? m.appTitle()} />
	<meta property="og:description" content={seo?.description ?? m.appDescription()} />
	<meta
		property="og:url"
		content={seo?.canonical ?? `https://nagi.suibari.com${page.url.pathname}`}
	/>
	<meta name="twitter:title" content={seo?.title ?? m.appTitle()} />
	<meta name="twitter:description" content={seo?.description ?? m.appDescription()} />
	{#if seo}<link rel="canonical" href={seo.canonical} />{/if}
</svelte:head>

<!-- 姉妹アプリ（botたんのお部屋）宛のリンクは、クリック時に SSO チケットを取って
     遷移させる。href に埋めるとチケットが失効するため、ここで横取りする。
     取得に失敗したら href の ?did= がそのまま使われる。 -->
<svelte:document onclick={interceptSiblingLinkClick} />

<MobileHeader />
<!-- ページ遷移時に本文位置と幅が動かないよう、すべてのルートで同じシェルを使う。
     例外は紹介ページだけで、左ナビの位置はそのまま右レールのぶん本文を広げる。 -->
<div class="shell" class:shell-wide={wideMain}>
	<SidebarLeft />
	<main>{@render children()}</main>
	{#if !wideMain}<SidebarRight />{/if}
</div>
<MobileNav />
<PostFollowNotice />
<!-- 投稿はページごとではなくアプリ全体の1つの入口に統一する。Composer は
     PostModal の中で常時マウントしたままにする（添付画像を失わないため）。 -->
{#if showPostFab}
	<PostFab
		onclick={() => ($session ? composerHost.show(defaultScope) : guestComposerHost.show())}
	/>
{/if}
{#if $session}
	<PostModal />
	<ReactionCardRewardHost />
	<!-- 記念日はその日しか来ないので、どの画面にいても受け取れるよう常駐させる。 -->
	<AnniversaryCardHost />
{:else if $oauthReady}
	<GuestPostModal open={guestComposerHost.open} onclose={() => guestComposerHost.hide()} />
{/if}
