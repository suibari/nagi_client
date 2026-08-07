import { describe, expect, it } from 'vitest';
import {
	applyContentWarning,
	contentWarningDisplay,
	hasContentWarning,
	parseContentWarning,
	validContentWarningSyntax,
} from './contentWarning';
import { parsePostText } from './facets';

const bytes = (value: string) => new TextEncoder().encode(value).length;

describe('parseContentWarning', () => {
	it('reports no content warning when there are no markers', () => {
		expect(parseContentWarning('ふつうの投稿')).toEqual({ status: 'none' });
	});

	it('accepts one balanced pair and reports its byte range', () => {
		const parsed = parseContentWarning('ねたばれ ||犯人は執事|| でした');
		expect(parsed).toMatchObject({
			status: 'valid',
			markerStart: 'ねたばれ '.length,
			markerEnd: 'ねたばれ ||犯人は執事'.length,
		});
		expect(parsed.status === 'valid' && parsed.range).toEqual({
			byteStart: bytes('ねたばれ ||'),
			byteEnd: bytes('ねたばれ ||犯人は執事'),
		});
	});

	it('rejects an unmatched marker', () => {
		expect(parseContentWarning('||途中まで')).toEqual({ status: 'invalid', reason: 'unmatched' });
	});

	it('rejects more than one pair', () => {
		expect(parseContentWarning('||a|| と ||b||')).toEqual({ status: 'invalid', reason: 'multiple' });
	});

	it('rejects an empty range', () => {
		expect(parseContentWarning('|| ||')).toEqual({ status: 'invalid', reason: 'empty' });
	});

	it('ignores markers inside code spans and escapes', () => {
		expect(parseContentWarning('`a || b`')).toEqual({ status: 'none' });
		expect(parseContentWarning('\\||a||')).toEqual({ status: 'invalid', reason: 'unmatched' });
	});

	it('exposes the two convenience predicates', () => {
		expect(hasContentWarning('||隠す||')).toBe(true);
		expect(hasContentWarning('ふつう')).toBe(false);
		// 「未入力」は入力途中でもありうるので、構文チェックだけは通す。
		expect(validContentWarningSyntax('ふつう')).toBe(true);
		expect(validContentWarningSyntax('||途中まで')).toBe(false);
	});
});

describe('applyContentWarning', () => {
	it('wraps the selection and keeps it selected', () => {
		expect(applyContentWarning('犯人は執事', 3, 5)).toEqual({
			text: '犯人は||執事||',
			selectionStart: 5,
			selectionEnd: 7,
		});
	});

	it('is a no-op for an empty selection', () => {
		expect(applyContentWarning('犯人は執事', 3, 3)).toEqual({
			text: '犯人は執事',
			selectionStart: 3,
			selectionEnd: 3,
		});
	});

	it('unwraps when the selection is inside the existing pair', () => {
		expect(applyContentWarning('犯人は||執事||', 5, 7)).toEqual({
			text: '犯人は執事',
			selectionStart: 3,
			selectionEnd: 5,
		});
	});

	it('moves the single pair when another range is selected', () => {
		// CW は1組しか持てないので、別範囲を選んだら既存を外して付け替える。
		expect(applyContentWarning('犯人は||執事||だった', 9, 12)).toEqual({
			text: '犯人は執事||だった||',
			selectionStart: 7,
			selectionEnd: 10,
		});
	});
});

describe('contentWarningDisplay', () => {
	it('removes the markers and shifts facet byte offsets by the 4 removed bytes', () => {
		const source = '||隠す|| https://example.com/a';
		const parsed = parsePostText(source);
		const shown = contentWarningDisplay(parsed.text, parsed.facets);
		expect(shown.text).toBe('隠す https://example.com/a');
		expect(shown.range).toEqual({ start: 0, end: '隠す'.length });
		// 元の facet は '||隠す|| ' の後ろから始まる。表示では '||' 2組ぶん詰まる。
		expect(shown.facets[0].index).toEqual({
			byteStart: bytes('隠す '),
			byteEnd: bytes('隠す ') + bytes('https://example.com/a'),
		});
	});

	it('leaves text and facets untouched when there is no valid pair', () => {
		const parsed = parsePostText('https://example.com/a');
		expect(contentWarningDisplay(parsed.text, parsed.facets)).toEqual({
			text: parsed.text,
			facets: parsed.facets,
		});
	});

	it('drops a facet that covered only the markers', () => {
		const shown = contentWarningDisplay('||隠す||', [
			{ index: { byteStart: 0, byteEnd: 2 }, features: [] },
		]);
		expect(shown.text).toBe('隠す');
		expect(shown.facets).toHaveLength(0);
	});
});
