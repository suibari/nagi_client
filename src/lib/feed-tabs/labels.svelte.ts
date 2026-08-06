/**
 * チャンネルタブの表示名キャッシュ。
 *
 * タブ自身も label のスナップショットを持っているが、そちらは同期対象なので
 * チャンネル名が変わるたびに書き換えると feedTabsUpdatedAt が無駄に進み、
 * 端末間の後勝ちが暴れる。解決済みの名前はこの端末ローカルの表だけを更新する。
 */
const KEY = 'nagi.feed-tabs.labels.v1';

let labels = $state<Record<string, string>>({});
let hydrated = false;

function hydrate() {
	if (hydrated) return;
	hydrated = true;
	try {
		const raw = localStorage.getItem(KEY);
		if (raw) labels = JSON.parse(raw) ?? {};
	} catch {
		// 読めなければタブ側の label スナップショットで描く。
	}
}

/** チャンネルを取得できた場所（一覧・詳細・my Nagi）から呼ぶ。 */
export function rememberChannelLabel(uri: string, name: string) {
	hydrate();
	if (!name || labels[uri] === name) return;
	labels = { ...labels, [uri]: name };
	try {
		localStorage.setItem(KEY, JSON.stringify(labels));
	} catch {
		// 保存できなくてもこのセッションのあいだは効く。
	}
}

export function channelLabel(uri: string | undefined): string | undefined {
	if (!uri) return undefined;
	hydrate();
	return labels[uri];
}

export const feedTabLabelsStorageKey = KEY;
