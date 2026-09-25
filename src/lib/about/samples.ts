import type { ChronicleEventView, DiaryMoodView } from '$lib/api/types';
import type { BusinessCardData } from '$lib/card/data';
import type { Locale } from '$lib/i18n/i18n.svelte';
import { absolute } from '$lib/seo/seo';

/**
 * /about で、サインインしないと見られない機能（感情グラフ・年表・名刺）を
 * 「どう見えるか」だけ伝えるための架空のユーザー。実在の人・投稿・ニュースは使わない。
 * ハンドルは example.com（予約ドメイン）にして、誰かのアカウントと重ならないようにする。
 */

const SAMPLE_DID = 'did:plc:about-sample';
/** 名刺の Avatar は相対パスに APPVIEW_URL を前置するので、絶対 URL で渡す。 */
const SAMPLE_AVATAR = absolute('/nagi_icon_trans.png');

type Text = { ja: string; en: string };
const pick = (text: Text, locale: Locale) => text[locale];

const NAME: Text = { ja: '凪野 そら', en: 'Sora Nagino' };

export function sampleDisplayName(locale: Locale): string {
	return pick(NAME, locale);
}

export function sampleAvatar(): string {
	return SAMPLE_AVATAR;
}

export function sampleNameCard(locale: Locale): BusinessCardData {
	return {
		did: SAMPLE_DID,
		handle: 'sora.example.com',
		displayName: pick(NAME, locale),
		avatar: SAMPLE_AVATAR,
		tags: locale === 'ja' ? ['散歩', '朝のパン', '夕焼け'] : ['walks', 'morning bread', 'sunsets'],
		tagline: pick(
			{
				ja: 'ちいさな発見を拾い集めて、毎日をやさしく言葉にする人。遠回りの帰り道がよく似合う、あたたかな観察者さん。',
				en: 'Gathers small discoveries and puts each day gently into words — a warm observer who suits the long way home.',
			},
			locale,
		),
		joinedAt: '2025-06-12T00:00:00.000Z',
		updatedAt: '2026-08-20T00:00:00.000Z',
		profileUrl: absolute('/about'),
	};
}

/** サーバと同じく古い順。年表は「はじまりから今へ」読む。 */
export function sampleChronicle(locale: Locale): ChronicleEventView[] {
	return [
		{ id: 'sample:bot_met', kind: 'bot_met', date: '2025-06-12' },
		{ id: 'sample:nagi_joined', kind: 'nagi_joined', date: '2025-06-12' },
		{
			id: 'sample:winter',
			kind: 'highlight',
			date: '2025-12-24',
			titleJa: '雪の日に、長いブログを書いた',
			titleEn: 'Wrote a long blog post on a snowy day',
			detailJa: 'ことばが止まらなくて、気づけば夜ふけ。書き切ったの、えらい！',
			detailEn: 'The words kept coming until late at night. You finished it — amazing!',
		},
		{ id: 'sample:first_card_ur', kind: 'first_card_ur', date: '2026-03-02' },
		{
			id: 'sample:sea',
			kind: 'highlight',
			date: '2026-08-14',
			titleJa: '海まで歩いた',
			titleEn: 'Walked to the sea',
			detailJa: 'ひさしぶりに遠回りして帰った日。夕焼け、きれいだったね。',
			detailEn: 'The long way home, for the first time in a while. What a sunset.',
		},
		{
			id: 'sample:news',
			kind: 'news_context',
			date: '2026-08-31',
			// 年表の news は表示言語の原題を1つだけ持つ。架空の見出しで、リンク先もない。
			news: {
				title: pick(
					{
						ja: '近所の水族館で、ペンギンの赤ちゃんが一般公開',
						en: 'Baby penguins make their debut at a local aquarium',
					},
					locale,
				),
			} as ChronicleEventView['news'],
		},
	];
}

const dateKey = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** 毎回同じ形のグラフになるよう、乱数は種つきにする。 */
function seeded(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const POSITIVE: Text[] = [
	{ ja: '朝のコーヒーがおいしく淹れられた', en: 'Made a really good cup of coffee this morning' },
	{ ja: '読みかけの本、やっと読み終えた', en: 'Finally finished the book I was reading' },
	{ ja: '友だちから久しぶりに連絡がきた', en: 'Heard from an old friend today' },
	{ ja: '洗濯物がよく乾いた。いい天気', en: 'The laundry dried perfectly. Lovely weather' },
];
const NEGATIVE: Text[] = [
	{ ja: 'ちょっと寝不足。ぼんやりしてる', en: 'Short on sleep. Feeling foggy' },
	{ ja: '雨で予定が流れてしまった', en: 'Rain washed out my plans' },
	{ ja: '仕事がなかなか進まない', en: 'Work is going slowly' },
];

/** 初期表示で開いておく日。その日の投稿は手で書いて、読んで分かる1日にする。 */
const HIGHLIGHT_OFFSET = 4;
const HIGHLIGHT_POSTS: Array<{ time: string; valence: number; text: Text }> = [
	{
		time: '08:12',
		valence: 3,
		text: {
			ja: '朝の散歩で、知らない路地に小さなパン屋さんを見つけた',
			en: 'Found a tiny bakery down an alley on my morning walk',
		},
	},
	{
		time: '13:40',
		valence: -2,
		text: {
			ja: '午後の会議、うまく話せなかったな',
			en: 'Couldn’t say what I meant at the meeting',
		},
	},
	{
		time: '19:05',
		valence: 4,
		text: {
			ja: '帰りに遠回りして海まで歩いた。夕焼けがすごかった',
			en: 'Took the long way home to the sea. The sunset was incredible',
		},
	},
	{
		time: '23:30',
		valence: 2,
		text: {
			ja: 'きょうはいい日だったことにする。おやすみ',
			en: 'Calling it a good day. Good night',
		},
	},
];

/**
 * 今日から1年ぶんの気分。日付が今日基準なので、描画はクライアントだけで行うこと
 * （プリレンダ時の日付と食い違わないように）。
 */
export function sampleMoods(
	locale: Locale,
	today = new Date(),
): { moods: DiaryMoodView[]; selected: string } {
	const random = seeded(7);
	const moods: DiaryMoodView[] = [];
	const day = (offset: number) =>
		new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset, 12);
	const selected = dateKey(day(HIGHLIGHT_OFFSET));
	for (let offset = 364; offset >= 0; offset--) {
		const date = dateKey(day(offset));
		if (offset === HIGHLIGHT_OFFSET) {
			for (const [index, post] of HIGHLIGHT_POSTS.entries())
				moods.push({
					uri: `sample:${date}:${index}`,
					date,
					createdAt: `${date}T${post.time}:00`,
					valence: post.valence,
					text: pick(post.text, locale),
				});
			continue;
		}
		// 書かない日もある。空白があるほうが本物らしい。
		if (random() < 0.3) continue;
		// ゆるい波（季節）と、日ごとのゆらぎ。
		const base = 1.2 + 1.6 * Math.sin(offset / 38) + 0.8 * Math.sin(offset / 9);
		const count = 1 + Math.floor(random() * 4);
		for (let index = 0; index < count; index++) {
			let valence = Math.round(base + (random() - 0.5) * 5);
			valence = Math.max(-5, Math.min(5, valence));
			if (valence === 0) valence = random() < 0.6 ? 1 : -1;
			const pool = valence > 0 ? POSITIVE : NEGATIVE;
			moods.push({
				uri: `sample:${date}:${index}`,
				date,
				createdAt: `${date}T${String(8 + index * 4).padStart(2, '0')}:00:00`,
				valence,
				text: pick(pool[Math.floor(random() * pool.length)], locale),
			});
		}
	}
	return { moods, selected };
}
