import { describe, expect, it } from 'vitest';
import type { ChronicleEventView } from '$lib/api/types';
import {
	chronicleEventDetail,
	chronicleEventLabel,
	groupChronicleByYear,
	loadAllChronicle,
	mergeChronicle,
} from './chronicle';
import type { ChroniclePage } from '$lib/api/types';

const event = (
	over: Partial<ChronicleEventView> & Pick<ChronicleEventView, 'id' | 'kind' | 'date'>,
) => over as ChronicleEventView;

describe('groupChronicleByYear', () => {
	it('年ごとにまとめ、順序を変えない（サーバは古い順で返す）', () => {
		const grouped = groupChronicleByYear([
			event({ id: 'c', kind: 'nagi_joined', date: '2025-05-31' }),
			event({ id: 'b', kind: 'anniversary_card', date: '2026-01-01' }),
			event({ id: 'a', kind: 'highlight', date: '2026-08-02' }),
		]);
		expect(grouped.map((y) => y.year)).toEqual(['2025', '2026']);
		expect(grouped[1].events.map((e) => e.id)).toEqual(['b', 'a']);
	});

	it('空配列は空のまま', () => {
		expect(groupChronicleByYear([])).toEqual([]);
	});

	it('同じ年が離れて出てきても見出しは分けない（ページ境界の重複を作らない）', () => {
		const grouped = groupChronicleByYear([
			event({ id: 'a', kind: 'highlight', date: '2026-01-02' }),
			event({ id: 'b', kind: 'highlight', date: '2026-08-02' }),
		]);
		expect(grouped).toHaveLength(1);
	});
});

describe('mergeChronicle', () => {
	it('id が重なる行は足さない', () => {
		const held = [event({ id: 'first:nagi_joined', kind: 'nagi_joined', date: '2025-06-01' })];
		const merged = mergeChronicle(held, [
			event({ id: 'first:nagi_joined', kind: 'nagi_joined', date: '2025-06-01' }),
			event({ id: 'stored:1', kind: 'highlight', date: '2025-07-01' }),
		]);
		expect(merged.map((e) => e.id)).toEqual(['first:nagi_joined', 'stored:1']);
	});
});

describe('chronicleEventLabel', () => {
	const labels = { nagi_joined: 'Nagi にやってきた日' };

	it('固定文言の kind はクライアントの i18n から引く（サーバに作らせない）', () => {
		const item = event({ id: 'first:nagi_joined', kind: 'nagi_joined', date: '2025-05-31' });
		expect(chronicleEventLabel(item, 'ja', labels)).toBe('Nagi にやってきた日');
	});

	it('LLM が書いた見出しはロケールで出し分ける', () => {
		const item = event({
			id: 'stored:1',
			kind: 'highlight',
			date: '2026-08-02',
			titleJa: '海まで歩いた',
			titleEn: 'Walked to the sea',
			detailJa: 'ひさしぶりの海。',
			detailEn: 'The sea, after a long while.',
		});
		expect(chronicleEventLabel(item, 'ja', labels)).toBe('海まで歩いた');
		expect(chronicleEventLabel(item, 'en', labels)).toBe('Walked to the sea');
		expect(chronicleEventDetail(item, 'en')).toBe('The sea, after a long while.');
	});

	it('片方の言語しか無ければ、ある方へ落とす', () => {
		const item = event({ id: 'stored:2', kind: 'highlight', date: '2026-08-03', titleJa: 'のみ' });
		expect(chronicleEventLabel(item, 'en', labels)).toBe('のみ');
		expect(chronicleEventDetail(item, 'ja')).toBeUndefined();
	});
});

describe('loadAllChronicle', () => {
	const page = (year: number, hasMore: boolean): ChroniclePage => ({
		year,
		revision: 'r'.repeat(64),
		items: [event({ id: `e${year}`, kind: 'highlight', date: `${year}-05-01` })],
		cursor: hasMore ? String(year + 1) : undefined,
		hasMore,
	});

	it('古い年から今年まで読み切り、各ページを通知する', async () => {
		const seen: number[] = [];
		const result = await loadAllChronicle(
			async (cursor) =>
				page(cursor ? Number(cursor) : 2024, (cursor ? Number(cursor) : 2024) < 2026),
			undefined,
			(p) => seen.push(p.year!),
		);
		expect(result.items.map((e) => e.id)).toEqual(['e2024', 'e2025', 'e2026']);
		expect(result.hasMore).toBe(false);
		expect(result.error).toBeUndefined();
		expect(seen).toEqual([2024, 2025, 2026]);
	});

	it('途中で失敗したら読めた年を残し、続きのcursorから再開できる', async () => {
		let fail = true;
		const fetchPage = async (cursor: string | undefined) => {
			const year = cursor ? Number(cursor) : 2024;
			if (year === 2025 && fail) throw new Error('down');
			return page(year, year < 2026);
		};
		const first = await loadAllChronicle(fetchPage);
		expect(first.items.map((e) => e.id)).toEqual(['e2024']);
		expect(first.cursor).toBe('2025');
		expect(first.hasMore).toBe(true);
		expect(first.error).toBeInstanceOf(Error);

		fail = false;
		const retried = await loadAllChronicle(fetchPage, first);
		expect(retried.items.map((e) => e.id)).toEqual(['e2024', 'e2025', 'e2026']);
		expect(retried.hasMore).toBe(false);
	});

	it('同じcursorが繰り返されたら打ち切る', async () => {
		let calls = 0;
		const result = await loadAllChronicle(async () => {
			calls++;
			return { ...page(2025, true), cursor: '2025' };
		});
		expect(calls).toBe(2);
		expect(result.hasMore).toBe(false);
	});
});
