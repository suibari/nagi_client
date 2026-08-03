/**
 * 解決済み publication の at-URI キャッシュ。listRecords を毎投稿で叩かないためのもので、
 * DID ごとに持つ。消えても listRecords で作り直せる（正しさは PDS 側が持つ）。
 * records.ts からも参照するため、依存を持たない単独モジュールに切っている。
 */
// v3: Nagi の記事公開では showInDiscover=true を保証する方針へ変えたため、既存キャッシュを
// 一度捨てて publication を再確認し、過去の false / 未設定レコードを次回公開時に補正する。
const CACHE_KEY = 'nagi-standardsite-publication.v3';

export function readPublicationCache(did: string): string | undefined {
	if (typeof window === 'undefined') return undefined;
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		if (!raw) return undefined;
		const parsed = JSON.parse(raw) as Record<string, string>;
		return typeof parsed[did] === 'string' ? parsed[did] : undefined;
	} catch {
		return undefined;
	}
}

export function writePublicationCache(did: string, uri: string | null): void {
	if (typeof window === 'undefined') return;
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
		if (uri === null) delete parsed[did];
		else parsed[did] = uri;
		window.localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
	} catch {
		// キャッシュできなくても listRecords で引き直せる。
	}
}

/** 全データ削除のあと、消えた publication を指し続けないための後始末。 */
export const forgetPublicationCache = (did: string) => writePublicationCache(did, null);
