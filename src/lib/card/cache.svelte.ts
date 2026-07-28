import { getProfile } from '$lib/api/appview';
import { i18n } from '$lib/i18n/i18n.svelte';
import { cardFromProfile, type BusinessCardData } from './data';

/**
 * did → 名刺データの遅延キャッシュ。
 *
 * タイムラインの ActorView には名刺の項目（tagline / tags / 更新日）が入っていない。
 * ホバーのたびに getProfile を叩くと同じ相手で何度も往復するので、did 単位で1回だけ
 * 取得して使い回す。件数は「ホバーした相手の数」で頭打ちなので上限は設けない。
 *
 * 言語を切り替えると tagline / tags の中身が変わるため、キーには locale も含める。
 */
type Entry = { data?: BusinessCardData };

const cache = new Map<string, Entry>();
/** 取得中の Promise。同じ did に複数回ホバーしても往復は1回で済ませる。 */
const inFlight = new Map<string, Promise<BusinessCardData | undefined>>();

const keyOf = (did: string, locale: string) => `${locale}:${did}`;

/** 取得済みなら即返す。ホバー直後の1フレーム目から中身を出すために使う。 */
export function cachedCard(did: string): BusinessCardData | undefined {
	return cache.get(keyOf(did, i18n.locale))?.data;
}

export async function loadCard(did: string): Promise<BusinessCardData | undefined> {
	const key = keyOf(did, i18n.locale);
	const hit = cache.get(key);
	if (hit) return hit.data;
	const pending = inFlight.get(key);
	if (pending) return await pending;

	const request = (async () => {
		try {
			// フィードは要らないので最小件数だけ取る（プロフィール本体が目的）。
			const page = await getProfile(did, { limit: 1, lang: i18n.locale });
			const data = cardFromProfile(page.profile, location.origin);
			cache.set(key, { data });
			return data;
		} catch {
			// 失敗はキャッシュしない。次にホバーしたときに再試行させる。
			return undefined;
		} finally {
			inFlight.delete(key);
		}
	})();
	inFlight.set(key, request);
	return await request;
}
