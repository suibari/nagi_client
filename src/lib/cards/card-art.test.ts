import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isLineArt } from './card-art';

const tokens = readFileSync(new URL('../../routes/styles/tokens.css', import.meta.url), 'utf8');

describe('line-art card backgrounds', () => {
	it('反転するのは透過の線画だけ', () => {
		expect(isLineArt('anniv-hbd')).toBe(true);
		expect(isLineArt('anniv-halloween')).toBe(false);
		expect(isLineArt(undefined)).toBe(false);
	});

	it('ライトはそのまま、ダークの両経路で反転する', () => {
		expect(tokens).toContain('--card-line-art-filter: none;');
		expect(tokens.match(/--card-line-art-filter: invert\(1\) hue-rotate\(180deg\);/g)).toHaveLength(
			2,
		);
	});
});
