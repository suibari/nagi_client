import { get } from 'svelte/store';
import {
	BLUESKY_INTERACTION_REPO_SCOPES,
	BLUESKY_INTERACTION_RPC_SCOPES,
	BLUESKY_VIEW_RPC_SCOPES,
	CROSSPOST_COLLECTION_SCOPE,
	CROSSPOST_SCOPE,
	STANDARD_SITE_COLLECTION_SCOPES,
	type ScopeOptIns,
} from '$lib/oauth/client';
import { session } from '$lib/oauth/session.svelte';

/**
 * 追加スコープを要する機能のオプトイン管理。
 *
 * どれも「localStorage の有効フラグ」と「実際に付与されたスコープ」の AND で動く。
 * 有効化には再サインインが必要なため、リダイレクト前に保留フラグを立て、
 * 戻ってきた +layout.svelte の resolvePendingOptIns() で確定させる。
 * 保存先が localStorage なので設定は端末ごとになる。
 */
export type OptInKind = 'crosspost' | 'standardSite';

type OptInSpec = {
	storageKey: string;
	pendingKey: string;
	/** 付与判定に使うコレクションスコープ。すべて揃っていれば付与済みとみなす。 */
	collections: string[];
};

const SPECS: Record<OptInKind, OptInSpec> = {
	crosspost: {
		storageKey: 'nagi-crosspost-bluesky',
		pendingKey: 'nagi-crosspost-pending',
		collections: [CROSSPOST_COLLECTION_SCOPE],
	},
	standardSite: {
		storageKey: 'nagi-standardsite',
		pendingKey: 'nagi-standardsite-pending',
		collections: STANDARD_SITE_COLLECTION_SCOPES,
	},
};

const KINDS = Object.keys(SPECS) as OptInKind[];

const read = (key: string) => {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
};

const write = (key: string, value: string | null) => {
	if (typeof window === 'undefined') return;
	try {
		if (value === null) window.localStorage.removeItem(key);
		else window.localStorage.setItem(key, value);
	} catch {
		// オプトイン設定は保存できなくても投稿自体には影響しない。
	}
};

export const getOptIn = (kind: OptInKind) => read(SPECS[kind].storageKey) === 'true';
export const setOptIn = (kind: OptInKind, enabled: boolean) =>
	write(SPECS[kind].storageKey, enabled ? 'true' : 'false');

export const isOptInPending = (kind: OptInKind) => read(SPECS[kind].pendingKey) === 'true';
export const markOptInPending = (kind: OptInKind) => write(SPECS[kind].pendingKey, 'true');
export const clearOptInPending = (kind: OptInKind) => write(SPECS[kind].pendingKey, null);

/**
 * 付与済みスコープに required がすべて含まれるか。パラメータ（action / aud）は見ない。
 * 旧セッションは action 無し（全操作許可）の広いスコープを保持しているため、
 * 完全一致だと既存ユーザーの機能が黙って止まる。
 */
export function scopesCover(grantedScope: string, required: string[]): boolean {
	const granted = grantedScope.split(' ');
	return required.every((scope) => granted.some((s) => s === scope || s.startsWith(`${scope}?`)));
}

type RepoGrant = { collections: Set<string>; actions?: Set<string> };

/** `repo:<nsid>?action=...` と `repo?collection=...&action=...` の両方の書き方を読む。 */
function parseRepoScope(scope: string): RepoGrant | undefined {
	if (scope !== 'repo' && !scope.startsWith('repo:') && !scope.startsWith('repo?'))
		return undefined;
	const [head, query = ''] = scope.split('?', 2);
	const params = new URLSearchParams(query);
	const collections = new Set(params.getAll('collection'));
	if (head.startsWith('repo:')) collections.add(head.slice('repo:'.length));
	const actions = params.getAll('action');
	return { collections, actions: actions.length ? new Set(actions) : undefined };
}

/**
 * repo 権限を action まで含めて判定する。scopesCover と違い、作成だけを許した旧セッションで
 * 削除を必要とする操作を使えるとはみなさない。action 未指定の付与は全操作を許す。
 */
export function repoScopesCover(grantedScope: string, required: string[]): boolean {
	const grants = grantedScope
		.split(' ')
		.map(parseRepoScope)
		.filter((grant): grant is RepoGrant => Boolean(grant));
	return required.every((scope) => {
		const need = parseRepoScope(scope);
		if (!need) return false;
		const needActions = need.actions ?? new Set(['create', 'update', 'delete']);
		return [...need.collections].every((collection) =>
			[...needActions].every((action) =>
				grants.some(
					(grant) =>
						(grant.collections.has(collection) || grant.collections.has('*')) &&
						(!grant.actions || grant.actions.has(action)),
				),
			),
		);
	});
}

async function grantedScope(): Promise<string | undefined> {
	const current = get(session);
	if (!current) return undefined;
	try {
		return (await current.getTokenInfo()).scope;
	} catch {
		return undefined;
	}
}

export async function sessionCovers(required: string[]): Promise<boolean> {
	const scope = await grantedScope();
	return scope !== undefined && scopesCover(scope, required);
}

/** 現在のセッションに、その機能が要求するコレクションの書き込み権限が付与されているか。 */
export const hasOptInScope = (kind: OptInKind) => sessionCovers(SPECS[kind].collections);

/**
 * Bluesky のフィードを読む権限があるか。クロスポストと同じ再認可で付与されるが、
 * 閲覧権限を足す前にクロスポストだけ許可した人がいるので、判定は別に持つ。
 */
export const hasBlueskyViewScope = () => sessionCovers(BLUESKY_VIEW_RPC_SCOPES);

/**
 * Bluesky 投稿へ操作する権限があるか（AUTH-08）。閲覧の後に足したので判定は別に持ち、
 * 投稿の削除まで要るので action も見る。
 */
export async function hasBlueskyInteractionScope(): Promise<boolean> {
	const scope = await grantedScope();
	return (
		scope !== undefined &&
		repoScopesCover(scope, [CROSSPOST_SCOPE, ...BLUESKY_INTERACTION_REPO_SCOPES]) &&
		scopesCover(scope, BLUESKY_INTERACTION_RPC_SCOPES)
	);
}

/**
 * いま付与されているオプトインの一覧。再認可のとき、片方を有効化する操作で
 * もう片方の権限を落とさないために signIn へ渡す。
 */
export async function grantedOptIns(): Promise<ScopeOptIns> {
	const entries = await Promise.all(KINDS.map(async (kind) => [kind, await hasOptInScope(kind)]));
	return Object.fromEntries(entries) as ScopeOptIns;
}

/**
 * 再サインインから戻ってきた直後の確定処理。
 * 保留フラグが立っていて実際にスコープが付与されていれば有効化する。
 */
export async function resolvePendingOptIns(): Promise<void> {
	for (const kind of KINDS) {
		if (!isOptInPending(kind)) continue;
		if (await hasOptInScope(kind)) setOptIn(kind, true);
		clearOptInPending(kind);
	}
}
