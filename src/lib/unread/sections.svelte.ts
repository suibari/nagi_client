import { createReadWatermark, isNewerPosition, type ReadWatermark } from './watermark.svelte';
import type { ReadPositionSection } from '$lib/api/types';
import { preferences } from '$lib/preferences/preferences.svelte';

/**
 * アカウント同期する既読セクションのレジストリ。
 *
 * 以前は画面を開くたびに createReadWatermark していたため、同じセクションでも
 * インスタンスがバラバラで、サーバーの位置を流し込む相手を決められなかった。
 * ここでセクションごとに1つに固定し、保存が前に進んだら preferences へ push する。
 *
 * storageKey と viewerDid はサインイン状態で変わる。変わったら作り直す
 * （前の利用者の既読を引き継がないため）。viewerDid が無い＝サインアウト中の閲覧は
 * 端末ローカルに閉じ、サーバーとは一切やり取りしない。
 */
type Entry = { storageKey: string; viewerDid?: string; watermark: ReadWatermark };
const entries = new Map<ReadPositionSection, Entry>();

/** サーバー側の位置と突き合わせ、ローカルが進んでいる分は押し戻す。 */
function reconcile(section: ReadPositionSection, entry: Entry) {
	if (!entry.viewerDid) return;
	const remote = preferences.remotePosition(section);
	const merged = entry.watermark.mergeRemote(remote);
	if (merged && (!remote || isNewerPosition(merged, remote)))
		preferences.pushReadPosition(section, merged);
}

export function sectionWatermark(
	section: ReadPositionSection,
	storageKey: string,
	viewerDid?: string,
): ReadWatermark {
	const existing = entries.get(section);
	if (existing?.storageKey === storageKey) return existing.watermark;
	const watermark = createReadWatermark(storageKey, {
		onPersist: viewerDid ? (seen) => preferences.pushReadPosition(section, seen) : undefined,
	});
	const entry: Entry = { storageKey, viewerDid, watermark };
	entries.set(section, entry);
	// 同期が済んだあとに開かれた画面でも、サーバーの既読をそのまま引き継ぐ。
	reconcile(section, entry);
	return watermark;
}

/**
 * 同期直後・送信直後に、そのアカウントのセクションをまとめて突き合わせ直す。
 * 別アカウント（やサインアウト中）のまま残っているエントリには触らない。
 */
export function reconcileSections(viewerDid: string) {
	for (const [section, entry] of entries)
		if (entry.viewerDid === viewerDid) reconcile(section, entry);
}

/**
 * メモリ上のウォーターマークを捨てる。全データ削除の直後に、生き残ったインスタンスが
 * 消したはずの localStorage を書き戻さないようにする。
 */
export function clearSections() {
	entries.clear();
}
