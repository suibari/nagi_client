/**
 * 投稿モーダルの書き方タブ。
 *
 * - simple（あっさり）: 本文・画像・CW だけの短文向け（記法の装飾は見せるが、装飾ボタンは出さない）
 * - rich（しっかり）:   文字装飾のボタンが付く長文向け
 * - blog（ブログ）:     rich に記事メタ（タイトル・ヘッダー画像・タグ）を足し、
 *                       standard.site へ記事としても公開するモード
 */
export type ComposerMode = 'simple' | 'rich' | 'blog';

export const COMPOSER_MODE_STORAGE_KEY = 'nagi:composer-mode:v1';

export const COMPOSER_MODES: ComposerMode[] = ['simple', 'rich', 'blog'];

export function isComposerMode(value: unknown): value is ComposerMode {
	return value === 'simple' || value === 'rich' || value === 'blog';
}

/**
 * 広いエディタ（文字装飾のボタン・下書き自動保存）を使うモードか。
 * 「しっかり」と「ブログ」の共通部分はここで1本にまとめ、
 * blog 固有の分岐だけを mode === 'blog' で書く。
 */
export const isWideComposer = (mode: ComposerMode) => mode !== 'simple';

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
