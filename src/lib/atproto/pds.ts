/**
 * 任意 DID の PDS をブラウザから解決し、未認証で公開レコードを読むためのヘルパ。
 * `com.atproto.repo.listRecords` / `getRecord` は公開エンドポイントなので認証不要で叩ける。
 * サーバ側 `apps/nagi_appview/src/util/pds.ts` + `services/emoji.ts:fetchEmojiRecord` の
 * クライアント版（DID ドキュメント解決は plc.directory / did:web well-known を fetch）。
 *
 * 注意: クライアント直読みは対象 PDS の CORS 設定に依存する。主要 PDS（bsky.network 系）は
 * com.atproto.repo.* に CORS を許可しているが、一部セルフホスト PDS では失敗しうる。
 */

export type RepoRecord = { uri: string; cid?: string; value: Record<string, unknown> };

const PLC_DIRECTORY = 'https://plc.directory';
const FETCH_TIMEOUT_MS = 10_000;

// 解決した PDS ベース URL を DID ごとにキャッシュ（プロフィール表示のたびに DID 解決しない）。
const pdsCache = new Map<string, string>();

type DidService = { id: string; type?: string; serviceEndpoint?: unknown };

function pdsFromDoc(doc: { service?: DidService[] } | null): string | null {
	const svc = doc?.service?.find(
		(s) => s.id === '#atproto_pds' || s.id.endsWith('#atproto_pds'),
	);
	const endpoint = svc?.serviceEndpoint;
	return typeof endpoint === 'string' && endpoint.startsWith('https://') ? endpoint : null;
}

/** did:web:example.com[:sub:path] → その DID ドキュメント URL。 */
function didWebDocUrl(did: string): string | null {
	const rest = did.slice('did:web:'.length);
	if (!rest) return null;
	const parts = rest.split(':').map((p) => decodeURIComponent(p));
	const host = parts[0];
	if (!host || host.includes('/')) return null;
	if (parts.length === 1) return `https://${host}/.well-known/did.json`;
	return `https://${host}/${parts.slice(1).join('/')}/did.json`;
}

async function fetchJson(url: string): Promise<any> {
	const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
	if (!res.ok) throw new Error(`Request failed (${res.status})`);
	return res.json();
}

/** DID から PDS のベース URL を解決する。did:plc は plc.directory、did:web は well-known。 */
export async function resolvePdsUrl(did: string): Promise<string> {
	const cached = pdsCache.get(did);
	if (cached) return cached;

	let doc: { service?: DidService[] } | null = null;
	if (did.startsWith('did:plc:')) {
		doc = await fetchJson(`${PLC_DIRECTORY}/${encodeURIComponent(did)}`);
	} else if (did.startsWith('did:web:')) {
		const url = didWebDocUrl(did);
		if (!url) throw new Error('Invalid did:web');
		doc = await fetchJson(url);
	} else {
		throw new Error('Unsupported DID method');
	}
	const pds = pdsFromDoc(doc);
	if (!pds) throw new Error('PDS not found in DID document');
	pdsCache.set(did, pds);
	return pds;
}

/** 対象 DID の PDS から、指定 collection のレコードを新しい順に取得（未認証）。 */
export async function listRecords(
	did: string,
	collection: string,
	opts: { limit?: number; cursor?: string } = {},
): Promise<{ records: RepoRecord[]; cursor?: string }> {
	const pds = await resolvePdsUrl(did);
	const params = new URLSearchParams({
		repo: did,
		collection,
		limit: String(opts.limit ?? 1),
		// listRecords は既定（reverse=false）で rkey 降順＝新しい順に返る（リファレンス PDS は
		// orderBy(key, reverse ? 'asc' : 'desc')）。TID rkey のアプリなら降順＝新しい順＝最新が先頭。
		reverse: 'false',
	});
	if (opts.cursor) params.set('cursor', opts.cursor);
	const body = await fetchJson(`${pds}/xrpc/com.atproto.repo.listRecords?${params}`);
	return { records: Array.isArray(body?.records) ? body.records : [], cursor: body?.cursor };
}

/** 対象 DID の PDS から単一レコードを取得（未認証）。存在しなければ null。 */
export async function getRecord(
	did: string,
	collection: string,
	rkey: string,
): Promise<RepoRecord | null> {
	const pds = await resolvePdsUrl(did);
	const params = new URLSearchParams({ repo: did, collection, rkey });
	try {
		const body = await fetchJson(`${pds}/xrpc/com.atproto.repo.getRecord?${params}`);
		if (!body?.value) return null;
		return { uri: body.uri, cid: body.cid, value: body.value };
	} catch {
		return null;
	}
}
