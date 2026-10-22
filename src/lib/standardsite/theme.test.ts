import { describe, expect, it } from 'vitest';
import { hasNagiTheme, NAGI_BASIC_THEME } from './types';

type Rgb = { r: number; g: number; b: number };

// WCAG 2.x の相対輝度。Bluesky の記事カードと同じ基準で accent の組を確かめる。
const luminance = ({ r, g, b }: Rgb) => {
	const channel = (value: number) => {
		const c = value / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (a: Rgb, b: Rgb) => {
	const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (high + 0.05) / (low + 0.05);
};

describe('Nagi publication theme', () => {
	it('keeps the button colours above the 4.5:1 Bluesky needs to use them', () => {
		expect(
			contrast(NAGI_BASIC_THEME.accent, NAGI_BASIC_THEME.accentForeground),
		).toBeGreaterThanOrEqual(4.5);
	});

	it('recognises the stored theme regardless of key order', () => {
		// PDS は DAG-CBOR のキー順で返す。
		const stored = {
			accent: { b: 209, g: 206, r: 0, $type: 'site.standard.theme.color#rgb' },
			$type: 'site.standard.theme.basic',
			foreground: { b: 66, g: 53, r: 47, $type: 'site.standard.theme.color#rgb' },
			background: { b: 249, g: 249, r: 247, $type: 'site.standard.theme.color#rgb' },
			accentForeground: { b: 61, g: 56, r: 20, $type: 'site.standard.theme.color#rgb' },
		};
		expect(hasNagiTheme(stored)).toBe(true);
	});

	it('asks for an update when the theme is missing or different', () => {
		expect(hasNagiTheme(undefined)).toBe(false);
		expect(
			hasNagiTheme({ ...NAGI_BASIC_THEME, accent: { ...NAGI_BASIC_THEME.accent, r: 1 } }),
		).toBe(false);
	});
});
