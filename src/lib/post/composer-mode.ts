/**
 * 投稿モーダルの書き方タブ。
 *
 * - simple（あっさり）: 本文・画像・CW だけの短文向け（記法の装飾は見せるが、装飾ボタンは出さない）
 * - rich（しっかり）:   文字装飾のボタンが付く長文向け
 * - diary（3行日記）:  TriLinesAt の3行日記（com.suibari.trilinesat.diary）を書くモード。
 *                       本文エディタの代わりに3行の入力欄を出す
 * - blog（ブログ）:     rich に記事メタ（タイトル・ヘッダー画像・タグ）を足し、
 *                       standard.site へ記事としても公開するモード
 */
export type ComposerMode = 'simple' | 'rich' | 'diary' | 'blog';

export const COMPOSER_MODE_STORAGE_KEY = 'nagi:composer-mode:v1';

export const COMPOSER_MODES: ComposerMode[] = ['simple', 'rich', 'diary', 'blog'];

export function isComposerMode(value: unknown): value is ComposerMode {
	return value === 'simple' || value === 'rich' || value === 'diary' || value === 'blog';
}

/**
 * 広いエディタ（文字装飾のボタン・下書き自動保存）を使うモードか。
 * 「しっかり」と「ブログ」の共通部分はここで1本にまとめ、
 * blog 固有の分岐だけを mode === 'blog' で書く。3行日記は本文エディタを使わないので含めない。
 */
export const isWideComposer = (mode: ComposerMode) => mode === 'rich' || mode === 'blog';

/**
 * 返信・引用やゲスト投稿のように、本人の PDS へ独立したレコードを作れない文脈でも選べるモード。
 * ブログと3行日記はどちらも返信・引用の文脈を持てない。
 */
export const isPlainPostMode = (mode: ComposerMode) => mode === 'simple' || mode === 'rich';

/**
 * タブの見た目上のまとまり。あっさり・しっかりはどちらも「ポスト」の書き方の違いなので
 * 1つのグループに入れ、3行日記とブログはそれぞれ別のものとして分ける。
 * 並びは渡した順を保ち、隣り合う同じグループだけをまとめる。
 */
export function groupComposerModes(modes: readonly ComposerMode[]): ComposerMode[][] {
	const groups: ComposerMode[][] = [];
	for (const mode of modes) {
		const last = groups.at(-1);
		if (last && isPlainPostMode(last[0]) && isPlainPostMode(mode)) last.push(mode);
		else groups.push([mode]);
	}
	return groups;
}

export function getComposerMode(): ComposerMode {
	if (typeof window === 'undefined') return 'simple';

	try {
		const stored = window.localStorage.getItem(COMPOSER_MODE_STORAGE_KEY);
		return isComposerMode(stored) ? stored : 'simple';
	} catch {
		return 'simple';
	}
}

export function setComposerMode(mode: ComposerMode): void {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.setItem(COMPOSER_MODE_STORAGE_KEY, mode);
	} catch {
		// 保存できない環境でも、現在のモーダル内での切替はそのまま使える。
	}
}

export function resetComposerMode(): ComposerMode {
	setComposerMode('simple');
	return 'simple';
}
