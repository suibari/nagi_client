/**
 * Composer の書き方。
 *
 * - simple（あっさり）: 本文・画像・CW だけの短文向け（記法の装飾は見せるが、装飾ボタンは出さない）
 * - rich（しっかり）:   文字装飾のボタンが付く長文向け
 * - diary（3行日記）:  TriLinesAt の3行日記（com.suibari.trilinesat.diary）を書くモード。
 *                       本文エディタの代わりに3行の入力欄を出す
 * - blog（ブログ）:     rich に記事メタ（タイトル・ヘッダー画像・タグ）を足し、
 *                       standard.site へ記事としても公開するモード。
 *                       ポストと行き来する場面がほぼないので、ポストモーダルのタブではなく
 *                       別のブログモーダル（BlogModal）で書く
 */
export type ComposerMode = 'simple' | 'rich' | 'diary' | 'blog';

export const COMPOSER_MODE_STORAGE_KEY = 'nagi:composer-mode:v1';

/** ポストモーダルのタブ。ブログは別モーダルなので含めない。 */
export type PostModalMode = Exclude<ComposerMode, 'blog'>;

export const COMPOSER_MODES: PostModalMode[] = ['simple', 'rich', 'diary'];

/** 端末に残すのはポストモーダルのタブだけ。以前のタブ時代に保存された 'blog' は捨てる。 */
export function isComposerMode(value: unknown): value is PostModalMode {
	return value === 'simple' || value === 'rich' || value === 'diary';
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
 * 1つのグループに入れ、3行日記は別のものとして分ける。
 * 並びは渡した順を保ち、隣り合う同じグループだけをまとめる。
 */
export function groupComposerModes<T extends ComposerMode>(modes: readonly T[]): T[][] {
	const groups: T[][] = [];
	for (const mode of modes) {
		const last = groups.at(-1);
		if (last && isPlainPostMode(last[0]) && isPlainPostMode(mode)) last.push(mode);
		else groups.push([mode]);
	}
	return groups;
}

export function getComposerMode(): PostModalMode {
	if (typeof window === 'undefined') return 'simple';

	try {
		const stored = window.localStorage.getItem(COMPOSER_MODE_STORAGE_KEY);
		return isComposerMode(stored) ? stored : 'simple';
	} catch {
		return 'simple';
	}
}

export function setComposerMode(mode: PostModalMode): void {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.setItem(COMPOSER_MODE_STORAGE_KEY, mode);
	} catch {
		// 保存できない環境でも、現在のモーダル内での切替はそのまま使える。
	}
}

export function resetComposerMode(): PostModalMode {
	setComposerMode('simple');
	return 'simple';
}
