// 先頭の @ / 全角＠(U+FF20) を除去し、前後空白を落とし小文字化する。
// handle は大小文字を区別しないので lower 正規化は安全。ユーザーが
// `@yourname.bsky.social` のように入力しても解決できるようにする。
export function normalizeHandle(input: string): string {
	return input
		.trim()
		.replace(/^[@＠]+/, '')
		.trim()
		.toLowerCase();
}
