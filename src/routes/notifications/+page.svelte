<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { getNotifications, getProfile, APPVIEW_URL } from '$lib/api/appview';
	import type { ActorView, NotificationView } from '$lib/api/types';
	import AvatarLink from '$lib/components/AvatarLink.svelte';
	import { stripMarkdown } from '$lib/atproto/markdown';
	import { displayEmojiName } from '$lib/atproto/bluemoji';
	import BluemojiMedia from '$lib/components/BluemojiMedia.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { markAllSeen } from '$lib/notifications/unread.svelte';
	import { pageRefresh } from '$lib/components/shell/nav';
	import { startVisiblePolling } from '$lib/polling';
	import { m, dateLocale, i18n } from '$lib/i18n/i18n.svelte';
	import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { isTranslationCandidate, postTranslations } from '$lib/i18n/postTranslations.svelte';
	import ContentWarningMask from '$lib/components/ContentWarningMask.svelte';
	import BusinessCard from '$lib/components/BusinessCard.svelte';
	import BusinessCardDialog from '$lib/components/BusinessCardDialog.svelte';
	import { cardFromProfile, type BusinessCardData } from '$lib/card/data';
	let items = $state<NotificationView[]>([]);
	let error = $state('');
	let loading = $state(true);
	let notificationCard = $state<BusinessCardData>();
	let cardComment = $state<string>();
	let cardBotActor = $state<ActorView>();
	let cardDialogOpen = $state(false);
	const relativeTimeBase = Date.now();
	/** 通知カード全体がリンクなので、サムネはギャラリー無しの素の img で並べる。 */
	const MAX_THUMBS = 4;
	let loaded = $state(false);
	let reloading = false;

	/**
	 * 一覧を取り直して、表示した分までを既読にする。
	 * マウント時だけでなくタブ復帰・ナビ再タップでも走らせる。1回きりにしていた頃は、
	 * この画面を開いたまま戻ってきても一覧が伸びず、バッジの数字も消えなかった。
	 */
	async function reload() {
		if (reloading || !$session) return;
		reloading = true;
		try {
			items = (await getNotifications()).items;
			// 通知に引用は出さないので、prepare が引用まで展開しないよう必要な項目だけ渡す。
			// 既に翻訳済み/翻訳中の投稿は prepare が飛ばすので、ポーリングで重複リクエストにならない。
			void postTranslations.prepare(
				items.flatMap((item) =>
					item.post
						? [
								{
									uri: item.post.uri,
									text: item.post.text,
									langs: item.post.langs,
									contentWarning: item.post.contentWarning,
									deleted: item.post.deleted,
								},
							]
						: [],
				),
			);
			// 表示した最新分までを一括既読にしてバッジを落とす。取得後に届いた通知は
			// まだ見えていないので、seenAt は表示済みの最新 createdAt に限定する。
			if (items.length) void markAllSeen(items[0].createdAt);
			error = '';
			// 名刺更新があるときだけ本人の最新名刺を1回取得する。通知行には更新当時の
			// スナップショットが無いので、複数行があってもすべて現在の名刺を表示する。
			if (!notificationCard && items.some((item) => item.type === 'analysis')) {
				try {
					const page = await getProfile($session.did, { limit: 1, lang: i18n.locale });
					notificationCard = cardFromProfile(page.profile, location.origin);
					cardComment = page.profile.comment;
					cardBotActor = page.feed.botActor;
				} catch {
					// 通知一覧そのものは表示し、名刺だけ従来のプロフィールリンクへフォールバックする。
					notificationCard = undefined;
				}
			}
		} catch (e) {
			// 再取得の失敗で、すでに出ている一覧を消さない。
			if (!items.length) error = e instanceof Error ? e.message : m.notifFetchFailed();
		} finally {
			reloading = false;
			loading = false;
		}
	}

	// OAuth 復元は非同期なので oauthReady を待つ。待たずに required API を叩くと、リロード時に
	// session がまだ null で "Authentication required" になる。
	$effect(() => {
		if (!$oauthReady || loaded) return;
		if (!$session) {
			location.href = '/login';
			return;
		}
		loaded = true;
		void reload();
	});
	// タブ復帰（と保険の60秒ポーリング）で最新へ追従する。
	onMount(() => startVisiblePolling(() => void reload(), 60_000, { onReturn: true }));
	// ナビの通知アイコンをもう一度押したときも開き直す。reload() が読む状態を依存に
	// 取り込まないよう untrack する（取り込むと初回ロードと二重に走る）。
	let refreshHandled = 0;
	$effect(() => {
		const requested = $pageRefresh;
		if (requested === refreshHandled) return;
		refreshHandled = requested;
		untrack(() => void reload());
	});
	const threadHref = (uri: string) => {
		const [, , did, , rkey] = uri.split('/');
		return `/thread/${did}/${rkey}`;
	};
	/**
	 * 日記はスレッドが無いので、本人のプロフィールの日記タブに飛ばす。
	 * 名刺の更新も同じくポストが無いので、名刺が置いてある自分のプロフィールへ。
	 */
	const notificationHref = (item: NotificationView) =>
		item.type === 'diary'
			? `/profile/${item.diary?.subject ?? $session?.did}?tab=diary${item.diary ? `&date=${item.diary.date}` : ''}`
			: item.type === 'analysis'
				? `/profile/${$session?.did}`
				: threadHref(item.subjectUri);
	const resolveImage = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
	/**
	 * 通知は素のテキスト表示（カード全体がリンク）なので TranslateToggle は使わず、
	 * 共有ストアから訳文だけ受け取る。翻訳待ち／失敗のときは undefined を返して原文表示へ落とす。
	 * 流し見する画面なので「翻訳中…」や再試行リンクといった状態表示は出さない。
	 */
	function notificationTranslation(item: NotificationView) {
		const post = item.post;
		if (!post || !languagePreferences.autoTranslate) return undefined;
		const target = languagePreferences.translationLanguage;
		if (!isTranslationCandidate(post, target)) return undefined;
		const entry = postTranslations.entry(post.uri, target);
		return entry?.status === 'translated' ? entry.text : undefined;
	}
	const relativeTime = (createdAt: string) => {
		const differenceSeconds = (new Date(createdAt).valueOf() - relativeTimeBase) / 1000;
		const absoluteSeconds = Math.abs(differenceSeconds);
		const formatter = new Intl.RelativeTimeFormat(dateLocale(), { numeric: 'auto' });
		if (absoluteSeconds < 60) return formatter.format(Math.round(differenceSeconds), 'second');
		if (absoluteSeconds < 3_600)
			return formatter.format(Math.round(differenceSeconds / 60), 'minute');
		if (absoluteSeconds < 86_400)
			return formatter.format(Math.round(differenceSeconds / 3_600), 'hour');
		return formatter.format(Math.round(differenceSeconds / 86_400), 'day');
	};
</script>

{#snippet reactionEmoji(reaction: NonNullable<NotificationView['reaction']>)}
	{#if reaction.bluemoji}<BluemojiMedia
			class="notification-emoji"
			emoji={reaction.bluemoji}
		/>{:else}{reaction.emoji}{/if}
{/snippet}

{#snippet notificationHead(item: NotificationView)}
	<div class="notification-head">
		<span class="what">
			<strong>{item.actor.displayName ?? item.actor.handle}</strong
			>{#if item.type === 'reaction' && item.reaction}{m.notifReactedWithPrefix()}{@render reactionEmoji(
					item.reaction,
				)}{m.notifReactedWithSuffix()}{:else if item.type === 'reply'}{m.notifRepliedSuffix()}{:else if item.type === 'reaction'}{m.notifReactedSuffix()}{:else if item.type === 'diary'}{m.notifDiarySuffix()}{:else if item.type === 'analysis'}{m.notifAnalysisSuffix()}{:else}{m.notifMentionedSuffix()}{/if}
		</span>
		<time class="when" datetime={item.createdAt}>{relativeTime(item.createdAt)}</time>
	</div>
{/snippet}

{#snippet notificationContent(item: NotificationView)}
	{@const translated = notificationTranslation(item)}
	<!-- 返信/メンションは新しい投稿、リアクションは対象投稿を AppView が post に入れる。 -->
	{#if item.type === 'diary' && item.diary}<p class="notification-subject">
			{stripMarkdown(item.diary.text)}
		</p>{:else if item.post?.contentWarning}<p class="notification-subject">
			{m.contentWarningNotification()}
		</p>{:else if item.post?.text}{#if translated}<p class="notification-label">
				{m.translationLabel()}
			</p>{/if}
		<p class="notification-subject">
			{stripMarkdown(translated ?? item.post.text)}
		</p>{/if}
	{#if item.post?.images?.length}<div class="notification-thumbs">
			{#each item.post.images.slice(0, MAX_THUMBS) as image}
				{#if image.contentWarning}
					<ContentWarningMask kind="image" interactive={false}
						><img src={resolveImage(image.url)} alt="" loading="lazy" /></ContentWarningMask
					>
				{:else}
					<img src={resolveImage(image.url)} alt={image.alt} loading="lazy" />
				{/if}
			{/each}
		</div>{/if}
{/snippet}

<section class="page-title"><h1>{m.navNotifications()}</h1></section>
<section class="timeline">
	{#if error}<div class="state error">{error}</div>
	{:else if loading}<div class="state">{m.loading()}</div>
	{:else if !items.length}<div class="state">{m.notifEmpty()}</div>
	{:else}
		{#each items as item (item.id)}
			{#if item.type === 'analysis' && notificationCard}
				<div class="notification card" class:unread={item.readAt == null}>
					<AvatarLink actor={item.actor} size="small" />
					<div class="notification-main">
						{@render notificationHead(item)}
						<div class="notification-name-card">
							<BusinessCard
								data={notificationCard}
								size="compact"
								onclick={() => (cardDialogOpen = true)}
							/>
						</div>
					</div>
				</div>
			{:else}
				<div class="notification card" class:unread={item.readAt == null}>
					<AvatarLink actor={item.actor} size="small" />
					<a class="notification-main" href={notificationHref(item)}>
						{@render notificationHead(item)}
						{@render notificationContent(item)}
					</a>
				</div>
			{/if}
		{/each}
	{/if}
</section>

{#if cardDialogOpen && notificationCard}
	<BusinessCardDialog
		data={notificationCard}
		comment={cardComment}
		botActor={cardBotActor}
		onclose={() => (cardDialogOpen = false)}
	/>
{/if}
