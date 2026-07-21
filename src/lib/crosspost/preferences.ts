import { get } from 'svelte/store';
import { CROSSPOST_SCOPE } from '$lib/oauth/client';
import { session } from '$lib/oauth/session.svelte';

export const CROSSPOST_STORAGE_KEY = 'nagi-crosspost-bluesky';
export const CROSSPOST_PENDING_STORAGE_KEY = 'nagi-crosspost-pending';

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
		// クロスポスト設定は保存できなくても投稿自体には影響しない。
	}
};

export const getCrosspostEnabled = () => read(CROSSPOST_STORAGE_KEY) === 'true';
export const setCrosspostEnabled = (enabled: boolean) =>
	write(CROSSPOST_STORAGE_KEY, enabled ? 'true' : 'false');

export const isCrosspostPending = () => read(CROSSPOST_PENDING_STORAGE_KEY) === 'true';
export const markCrosspostPending = () => write(CROSSPOST_PENDING_STORAGE_KEY, 'true');
export const clearCrosspostPending = () => write(CROSSPOST_PENDING_STORAGE_KEY, null);

/** 現在のセッションに Bluesky への書き込み権限が付与されているか。 */
export async function hasCrosspostScope(): Promise<boolean> {
	const current = get(session);
	if (!current) return false;
	try {
		const info = await current.getTokenInfo();
		return info.scope.split(' ').includes(CROSSPOST_SCOPE);
	} catch {
		return false;
	}
}

/**
 * 再サインインから戻ってきた直後の確定処理。
 * 保留フラグが立っていて実際にスコープが付与されていれば有効化する。
 */
export async function resolveCrosspostPending(): Promise<void> {
	if (!isCrosspostPending()) return;
	const granted = await hasCrosspostScope();
	if (granted) setCrosspostEnabled(true);
	clearCrosspostPending();
}
