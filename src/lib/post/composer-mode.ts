export type ComposerMode = 'simple' | 'rich';

export const COMPOSER_MODE_STORAGE_KEY = 'nagi:composer-mode:v1';

export function isComposerMode(value: unknown): value is ComposerMode {
	return value === 'simple' || value === 'rich';
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
