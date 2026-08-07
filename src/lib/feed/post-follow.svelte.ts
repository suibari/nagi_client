import { tick } from 'svelte';

type PostFollowNotice = {
	href: string;
};

/**
 * 投稿したあと、その投稿・返信へ画面を追従させるための状態。
 *
 * 投稿は「楽観カード → サーバー確定カード」と2段階で DOM が入れ替わり、会話グループでは
 * 確定時にスレッドカードごと位置が変わる。そのため送信直後に一度 scrollIntoView するだけでは
 * 追いつけず、差し替わった先を見失う（返信したスレッドが消えたように見える原因のひとつ）。
 * ここでは追従先を状態として持ち、リストが変わるたびに引き直す。
 */
type FollowTarget = {
	/** 楽観カードの識別子。確定 uri が入るまではこれで DOM を探す。 */
	optimisticKey: string;
	/** createPost が通ったあとの実 uri。 */
	uri?: string;
	/** 追従先を出せなかったときに見せる導線。 */
	href?: string;
	/** 会話グループのマージキー。Feed.refresh がこのスレッドだけサーバー順へ戻す。 */
	threadRootUri?: string;
};

const state = $state<{ notice?: PostFollowNotice; target?: FollowTarget }>({});

/** 投稿の AT-URI からスレッドページの相対 URL へ。追従できなかったときの導線に使う。 */
export function postHref(uri: string): string {
	const [did, , rkey] = uri.slice('at://'.length).split('/');
	return `/thread/${did}/${rkey}`;
}

export const postFollowNotice = {
	get current() {
		return state.notice;
	},
	show(href: string) {
		state.notice = { href };
	},
	clear() {
		state.notice = undefined;
	},
};

/** 追い続ける上限。AppView の取り込みが遅れても、いつまでも画面を動かさない。 */
const FOLLOW_TIMEOUT = 20_000;
/** 確定してからこの時間だけ待って、まだどこにも出ていなければ導線に切り替える。 */
const NOTICE_DELAY = 800;

let expiry: ReturnType<typeof setTimeout> | undefined;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
/** 直前に寄せたノード。同じノードへ二度寄せない（ユーザーのスクロールを奪わないため）。 */
let lastScrolled: Element | undefined;

function stop() {
	if (expiry) clearTimeout(expiry);
	if (noticeTimer) clearTimeout(noticeTimer);
	expiry = undefined;
	noticeTimer = undefined;
	lastScrolled = undefined;
	state.target = undefined;
}

export const postFollow = {
	get current() {
		return state.target;
	},
	/**
	 * 送信開始。楽観カードが出たらそこへ、サーバーが確定したらその投稿へ画面を寄せる。
	 * threadRootUri は返信のときだけ渡す（Feed.refresh の並べ直し対象になる）。
	 */
	begin(optimisticKey: string, options: { threadRootUri?: string } = {}) {
		postFollowNotice.clear();
		stop();
		state.target = { optimisticKey, ...options };
		expiry = setTimeout(stop, FOLLOW_TIMEOUT);
	},
	/** createPost が通った。ここで初めて実 uri と導線が決まる。 */
	settle(uri: string, href: string) {
		const target = state.target;
		if (!target) return;
		state.target = {
			...target,
			uri,
			href,
			threadRootUri: target.threadRootUri ?? uri,
		};
		// 表示中の画面に出せない投稿（検索タブ・通知画面など）は追従しようがないので、
		// 少し待ってから導線だけ出す。楽観カードへ既に寄せてあるなら何も出さない。
		noticeTimer = setTimeout(() => {
			if (!lastScrolled) {
				postFollowNotice.show(href);
				stop();
			}
		}, NOTICE_DELAY);
	},
	/** 投稿自体が失敗した。追従も導線も出さない。 */
	fail: stop,
	/** 画面を移ったなどで追従をやめる。 */
	cancel: stop,
	/** 確定した投稿へ寄せ終わった。 */
	finish: stop,
};

const scrollBehavior = (): ScrollBehavior =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

export function scrollToElement(element?: Element | null) {
	element?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}

/**
 * 投稿1件の DOM。カードと内側のバブルが同じ uri を持つ場面があるので、内側
 * （＝ドキュメント順で最後の一致）を選ぶ。返信したときにカードの先頭ではなく
 * 自分の発言そのものへ寄るようにするため。
 */
function findPost(uri: string): Element | undefined {
	const nodes = document.querySelectorAll(`[data-post-uri="${CSS.escape(uri)}"]`);
	return nodes[nodes.length - 1];
}

function findOptimistic(key: string): Element | undefined {
	return document.querySelector(`[data-optimistic-key="${CSS.escape(key)}"]`) ?? undefined;
}

/**
 * 投稿直後の画面追従。deps（描画中のリスト）が変わるたびに追従先を引き直し、
 * 楽観カード → 確定カードの順に画面を寄せる。寄せるのは実質2回だけで、同じノードへは
 * 二度寄せない（ポーリング更新のたびに画面を引き戻さないため）。
 */
export function followPostedScroll(deps: () => unknown) {
	$effect(() => {
		deps();
		const target = state.target;
		if (!target) return;
		void tick().then(() => {
			const current = state.target;
			if (!current) return;
			const node =
				(current.uri ? findPost(current.uri) : undefined) ?? findOptimistic(current.optimisticKey);
			if (!node) return;
			if (node !== lastScrolled) {
				lastScrolled = node;
				scrollToElement(node);
			}
			// 楽観カードの外＝サーバーが返した確定表示。ここまで来たら追従は終わり。
			if (!node.closest('[data-optimistic-key]')) postFollow.finish();
		});
	});
}
