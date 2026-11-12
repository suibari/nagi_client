<script lang="ts">
	import type { ChronicleEventView } from '$lib/api/types';
	import ChronicleTimeline from '$lib/components/ChronicleTimeline.svelte';

	/**
	 * 年表のスクロール演出を、APIもDBも無しで確かめるためのページ。
	 * reduced-motion を切り替えたときに**要素が消えないこと**もここで見る。
	 */
	const did = 'did:plc:chronicle-preview';
	const event = (
		over: Partial<ChronicleEventView> & Pick<ChronicleEventView, 'id' | 'kind' | 'date'>,
	): ChronicleEventView => over as ChronicleEventView;

	// サーバは古い順で返す。年表は「はじまりから今へ」読むもの。
	const items: ChronicleEventView[] = [
		event({ id: 'first:bot_met', kind: 'bot_met', date: '2024-11-20' }),
		event({ id: 'first:nagi_joined', kind: 'nagi_joined', date: '2025-05-31' }),
		event({ id: 'first:first_card_ur', kind: 'first_card_ur', date: '2026-07-02' }),
		event({ id: 'anniversary:a', kind: 'anniversary_card', date: '2026-07-07' }),
		event({
			id: 'stored:1',
			kind: 'highlight',
			date: '2026-08-14',
			titleJa: '海まで歩いた',
			titleEn: 'Walked to the sea',
			detailJa: 'ひさしぶりに、遠回りして帰った日。',
			detailEn: 'The long way home, for the first time in a while.',
			diaryDate: '2026-08-14',
		}),
		// そのころ世の中では。まとめの下に紐づく一行として描かれる（日付は出ない）。
		event({
			id: 'news_context:2026-08',
			kind: 'news_context',
			date: '2026-08-31',
			// 年表に出るのは記事の原題（news.title）。titleJa は使わない。
			news: {
				url: 'https://example.com/story',
				title: '「キングダム ハーツ」初のオリジナルアニメ化決定! 野村哲也氏ら制作チーム参加',
			} as ChronicleEventView['news'],
		}),
	];

	// スクラバーと末尾からの表示を確かめるため、数年ぶんの月まとめを足す。
	const months = ['01', '03', '05', '07', '09', '11'];
	const filler: ChronicleEventView[] = ['2025', '2026'].flatMap((year) =>
		months.map((month) =>
			event({
				id: `filler:${year}-${month}`,
				kind: 'highlight',
				date: `${year}-${month}-10`,
				titleJa: `${Number(month)}月のできごと`,
				titleEn: `What happened in month ${Number(month)}`,
				detailJa: 'いつもの道で、季節が変わったことに気づいた。',
				detailEn: 'Noticed the season had turned on the usual road.',
				diaryDate: `${year}-${month}-10`,
			}),
		),
	);
	const all = [...items, ...filler].sort((x, y) => x.date.localeCompare(y.date));
</script>

<section class="page-title"><h1>年表プレビュー（開発専用）</h1></section>
<p class="dev-note">
	開くと末尾（いま）から表示され、右端のスクラバーで年を移れる。OSの「視差効果を減らす」を入れると
	演出は止まるが、<strong>項目そのものは必ず見えたまま</strong>であること。
</p>
<section class="timeline">
	<ChronicleTimeline {did} displayName="すいばり" avatar="/bot_icon_trans.png" preview={all} />
</section>

<style>
	.dev-note {
		padding: 0 1rem 1rem;
		font-size: 13px;
		color: var(--text-faint);
	}
</style>
