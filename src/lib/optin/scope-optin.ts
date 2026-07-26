import { get } from 'svelte/store';
import {
	CROSSPOST_COLLECTION_SCOPE,
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

/** 現在のセッションに、その機能が要求するコレクションの書き込み権限が付与されているか。 */
export async function hasOptInScope(kind: OptInKind): Promise<boolean> {
	const current = get(session);
	if (!current) return false;
	try {
		const info = await current.getTokenInfo();
		const granted = info.scope.split(' ');
		// 旧セッションは action 無し（全操作許可）の広いスコープを保持しているため、
		// 完全一致だと既存ユーザーの機能が黙って止まる。コレクション単位で判定する。
		return SPECS[kind].collections.every((collection) =>
			granted.some((s) => s === collection || s.startsWith(`${collection}?`)),
		);
	} catch {
		return false;
	}
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
