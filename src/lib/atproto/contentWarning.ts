import type { Facet } from '$lib/api/types';

export type ContentWarningRange = { byteStart: number; byteEnd: number };
export type ContentWarningParseResult =
	| { status: 'none' }
	| { status: 'invalid'; reason: 'unmatched' | 'multiple' | 'empty' }
	| {
			status: 'valid';
			range: ContentWarningRange;
			markerStart: number;
			markerEnd: number;
	  };

const encoder = new TextEncoder();

export function parseContentWarning(text: string): ContentWarningParseResult {
	const markers: number[] = [];
	let inCode = false;
	for (let index = 0; index < text.length; index++) {
		if (text[index] === '\\') {
			index++;
			continue;
		}
		if (text[index] === '`') {
			inCode = !inCode;
			continue;
		}
		if (!inCode && text.startsWith('||', index)) {
			markers.push(index);
			index++;
		}
	}
	if (!markers.length) return { status: 'none' };
	if (markers.length % 2 !== 0) return { status: 'invalid', reason: 'unmatched' };
	if (markers.length !== 2) return { status: 'invalid', reason: 'multiple' };
	const [markerStart, markerEnd] = markers;
	if (!text.slice(markerStart + 2, markerEnd).trim()) {
		return { status: 'invalid', reason: 'empty' };
	}
	return {
		status: 'valid',
		range: {
			byteStart: encoder.encode(text.slice(0, markerStart + 2)).length,
			byteEnd: encoder.encode(text.slice(0, markerEnd)).length,
		},
		markerStart,
		markerEnd,
	};
}

export const hasContentWarning = (text: string) => parseContentWarning(text).status === 'valid';
export const validContentWarningSyntax = (text: string) =>
	parseContentWarning(text).status !== 'invalid';

const shiftAfterRemoval = (position: number, markerStart: number, markerEnd: number) => {
	if (position <= markerStart) return position;
	if (position <= markerEnd) return position - 2;
	return position - 4;
};

/**
 * 選択範囲を || で囲む。既存CW内を選んだ場合は解除し、別範囲なら既存の1組を移動する。
 */
export function applyContentWarning(
	text: string,
	selectionStart: number,
	selectionEnd: number,
): { text: string; selectionStart: number; selectionEnd: number } {
	if (selectionStart === selectionEnd) return { text, selectionStart, selectionEnd };
	const parsed = parseContentWarning(text);
	if (parsed.status === 'invalid') return { text, selectionStart, selectionEnd };
	if (parsed.status === 'valid') {
		const innerStart = parsed.markerStart + 2;
		const innerEnd = parsed.markerEnd;
		const without = `${text.slice(0, parsed.markerStart)}${text.slice(innerStart, innerEnd)}${text.slice(
			parsed.markerEnd + 2,
		)}`;
		if (selectionStart >= innerStart && selectionEnd <= innerEnd) {
			return {
				text: without,
				selectionStart: selectionStart - 2,
				selectionEnd: selectionEnd - 2,
			};
		}
		selectionStart = shiftAfterRemoval(selectionStart, parsed.markerStart, parsed.markerEnd);
		selectionEnd = shiftAfterRemoval(selectionEnd, parsed.markerStart, parsed.markerEnd);
		text = without;
	}
	return {
		text: `${text.slice(0, selectionStart)}||${text.slice(selectionStart, selectionEnd)}||${text.slice(
			selectionEnd,
		)}`,
		selectionStart: selectionStart + 2,
		selectionEnd: selectionEnd + 2,
	};
}

/**
 * CWボタンによる区切りの追加・削除・移動後も、メンションなどの選択範囲を保持する。
 * 開始位置は直前への挿入に追従し、終了位置は直後への挿入を範囲に含めない。
 */
export function remapContentWarningSelection(
	previous: string,
	result: ReturnType<typeof applyContentWarning>,
	start: number,
	end: number,
): { start: number; end: number } {
	const parsed = parseContentWarning(previous);
	let mappedStart = start;
	let mappedEnd = end;
	let without = previous;
	if (parsed.status === 'valid') {
		without = `${previous.slice(0, parsed.markerStart)}${previous.slice(
			parsed.markerStart + 2,
			parsed.markerEnd,
		)}${previous.slice(parsed.markerEnd + 2)}`;
		mappedStart = shiftAfterRemoval(start, parsed.markerStart, parsed.markerEnd);
		mappedEnd = shiftAfterRemoval(end, parsed.markerStart, parsed.markerEnd);
		if (result.text === without) return { start: mappedStart, end: mappedEnd };
	}

	const wrapStart = result.selectionStart - 2;
	const wrapEnd = result.selectionEnd - 2;
	if (mappedStart >= wrapStart) mappedStart += 2;
	if (mappedStart >= wrapEnd + 2) mappedStart += 2;
	if (mappedEnd > wrapStart) mappedEnd += 2;
	if (mappedEnd > wrapEnd + 2) mappedEnd += 2;
	return { start: mappedStart, end: mappedEnd };
}

/**
 * 表示用に || を除き、facet のUTF-8範囲も4バイト分補正する。
 */
export function contentWarningDisplay(
	text: string,
	facets: Facet[] = [],
): {
	text: string;
	facets: Facet[];
	range?: { start: number; end: number };
} {
	const parsed = parseContentWarning(text);
	if (parsed.status !== 'valid') return { text, facets };
	const innerStart = parsed.markerStart + 2;
	const innerEnd = parsed.markerEnd;
	const visible = `${text.slice(0, parsed.markerStart)}${text.slice(innerStart, innerEnd)}${text.slice(
		parsed.markerEnd + 2,
	)}`;
	const openByte = encoder.encode(text.slice(0, parsed.markerStart)).length;
	const closeByte = encoder.encode(text.slice(0, parsed.markerEnd)).length;
	const mapByte = (position: number) => {
		if (position <= openByte) return position;
		if (position <= openByte + 2) return openByte;
		if (position <= closeByte) return position - 2;
		if (position <= closeByte + 2) return closeByte - 2;
		return position - 4;
	};
	const adjusted = facets.flatMap((facet) => {
		const byteStart = mapByte(facet.index.byteStart);
		const byteEnd = mapByte(facet.index.byteEnd);
		// 区切りだけを指すfacetは表示文字が残らないため捨てる。
		if (byteEnd <= byteStart) return [];
		return [{ ...facet, index: { byteStart, byteEnd } }];
	});
	return {
		text: visible,
		facets: adjusted,
		range: {
			start: parsed.markerStart,
			end: parsed.markerEnd - 2,
		},
	};
}
