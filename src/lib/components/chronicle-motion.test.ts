// 静的ソース検査は Vitest の Node 環境で実行する（interaction-motion.test.ts と同じ流儀）。
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const timeline = read('./ChronicleTimeline.svelte');
const diaryPage = read('../../routes/diary/+page.svelte');
const componentsCss = read('../../routes/styles/components.css');
const baseCss = read('../../routes/styles/base.css');
const ja = read('../i18n/ja.ts');
const en = read('../i18n/en.ts');

describe('chronicle motion contracts', () => {
	it('基底状態を透明にしない（reduced-motion で要素ごと消える）', () => {
		// base.css が全要素へ animation: none !important を当てるので、
		// 要素側に opacity: 0 を置くと演出を切っている人には永久に見えない。
		expect(baseCss).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none !important/);
		expect(componentsCss).toMatch(/@keyframes chronicle-rise \{\s*from \{\s*opacity: 0;/);
		const revealed = /\.chronicle-revealed \{([\s\S]*?)\}/.exec(componentsCss)?.[1] ?? '';
		expect(revealed).toContain('animation: chronicle-rise');
		expect(revealed).not.toContain('opacity');
		expect(timeline).not.toMatch(/\.chronicle-item\s*\{[^}]*opacity:\s*0/s);
	});

	it('reduced-motion のときは observer を起動しない', () => {
		expect(timeline).toContain("matchMedia('(prefers-reduced-motion: reduce)').matches");
		expect(timeline).toContain('new IntersectionObserver');
	});

	it('無限スクロールは共通の InfiniteScroll を使う（自前で書かない）', () => {
		expect(timeline).toContain('<InfiniteScroll');
		expect(timeline).toContain("from './InfiniteScroll.svelte'");
	});

	it('そのころ世の中では、はまとめに付く一行として描く（独立した節目にしない）', () => {
		// 「8/19 まとめ ＋ その下にこの頃の世間の出来事」という読ませ方。
		// 月まとめのニュースだけは大きなニュースカードにしない。
		const attached = /{#if isAttachedNews\(event\)}([\s\S]*?){:else}/.exec(timeline)?.[1] ?? '';
		expect(timeline).toContain('isAttachedNews(event)');
		expect(attached).toContain('chronicle-aside');
		expect(attached).not.toContain('NewsCard');
		expect(timeline).toContain('<NewsCard news={event.news} embedded />');
	});

	it('過去の1枚を見返すのに祝わせない（CardDetailDialog へ draw を渡さない）', () => {
		const dialog = /<CardDetailDialog[^/]*\/>/.exec(timeline)?.[0] ?? '';
		expect(dialog).toContain('initial={opened}');
		expect(dialog).not.toContain('draw');
		// 紙吹雪は「いま受け取る」ための演出。年表は静かに読ませる。
		expect(timeline).not.toContain('Confetti');
	});

	it('?date= のディープリンクは必ず年間アクティビティを開く', () => {
		// 通知からの /diary?date=YYYY-MM-DD は草グラフの該当日を開く導線。
		expect(diaryPage).toMatch(/!page\.url\.searchParams\.get\('date'\)[\s\S]*'chronicle'/);
	});

	it('新しい文言は ja と en の両方にある', () => {
		for (const key of [
			'diaryTabActivity',
			'diaryTabChronicle',
			'diaryTabsAria',
			'chronicleAbout',
			'chronicleEmpty',
			'chronicleFetchFailed',
			'chronicleOpenDiary',
			'chronicleYearAria',
			'chronicleKindNagiJoined',
			'chronicleKindBotMet',
			'chronicleKindFirstCardUr',
			'chronicleKindFirstCardAar',
			'chronicleKindAnniversaryCard',
			'chronicleKindNewsContext',
			'chronicleKindHighlight',
		]) {
			expect(ja, `ja.${key}`).toContain(`${key}:`);
			expect(en, `en.${key}`).toContain(`${key}:`);
		}
	});

	it('固定文言の kind ラベルはサーバではなく i18n から引く', () => {
		// サーバで ja/en を作ると、その行を作った時点の言語で固まる。
		expect(timeline).toContain('m.chronicleKindNagiJoined()');
		expect(timeline).toContain('chronicleEventLabel(event, i18n.locale, labels)');
	});
});
