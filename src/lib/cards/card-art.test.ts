import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isLineArt } from './card-art';

const tokens = readFileSync(new URL('../../routes/styles/tokens.css', import.meta.url), 'utf8');

describe('line-art card backgrounds', () => {
	it('反転するのは透過の線画だけ', () => {
		expect(isLineArt('anniv-hbd')).toBe(true);
		expect(isLineArt('anniv-thanksgiving-us')).toBe(true);
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

describe('missing card art', () => {
	const card = readFileSync(
		new URL('../components/AffirmationCard.svelte', import.meta.url),
		'utf8',
	);

	it('画像が無い記念日は読み込み失敗で文字だけのカードへ戻す', () => {
		// AppView は全記念日に anniv-{id} を送るので、static/card-art に無い名前が普通に来る。
		expect(card).toContain('onerror={() => (missingArt = art)}');
		expect(card).toMatch(
			/const art = \$derived\(revealed && card\.art !== missingArt \? card\.art : undefined\)/,
		);
		// has-art（ベールと帯）も art に連動して外れる。
		expect(card).toContain('class:has-art={!!art}');
	});
});
