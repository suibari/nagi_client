import type { BusinessCardData } from './data';

/**
 * 名刺デザインを詰めるためのダミーデータ。/dev/name-card から使う。
 *
 * 「標準的な1件」だけでは崩れる条件が見つからないので、レイアウトが壊れやすい入力を
 * 並べてある。Gemini も DB も起動せずにここだけで確認しきれるのが狙い。
 */

/**
 * static/ にある既存画像。アバターのアスペクト比による見え方の違いを確かめるのに使う。
 * `.avatar img` は object-fit: cover なので、非正方形でも短辺を円に合わせて
 * 長辺を上下（左右）対称に切り落とす＝中身がずれることはない。それを目で確認するための材料。
 */
const AVATARS = {
	/** 381x464。やや縦長。 */
	tall: '/bot_icon_trans.png',
	/** 512x512。完全な正方形。実際のユーザーアバターは AvatarCropper を通るので必ずこの形。 */
	square: '/nagi_icon.png',
	/** 1200x630。極端な横長(1.9:1)。cover の切り取りが一番はっきり出る。 */
	wide: '/nagi_ogp.jpg',
} as const;

const BASE = {
	did: 'did:plc:example0000000000000000',
	handle: 'nagi-user.bsky.social',
	displayName: '凪野 そら',
	// 同一オリジンの static/ を使う（ダミーで実 PDS を叩かないため）。
	// cardFixtures() で location.origin を前置する。別オリジンのアバターで
	// canvas 汚染を確かめたいときは「実データ」モードを使うこと。
	avatar: AVATARS.tall,
	joinedAt: '2026-03-14T00:00:00.000Z',
	updatedAt: '2026-07-28T09:30:00.000Z',
	profileUrl: 'https://nagi.suibari.com/profile/did:plc:example0000000000000000',
} satisfies Omit<BusinessCardData, 'tags' | 'tagline'>;

export type CardFixture = { id: string; label: string; data: BusinessCardData };

const FIXTURES: CardFixture[] = [
	{
		id: 'standard',
		label: '標準（日本語・3タグ・短めの tagline）',
		data: {
			...BASE,
			tags: ['猫と暮らす', '深夜の創作', '写真'],
			tagline: '夜ふけの静けさを写真と言葉で掬いあげる、やさしい観察者さん。',
		},
	},
	{
		id: 'long-names',
		label: '表示名・ハンドルが長い',
		data: {
			...BASE,
			displayName: 'とてもとても長い表示名のユーザーさんこんにちは今日もいい天気ですね',
			handle: 'very-long-handle-name-for-testing.bsky.social',
			tags: ['読書', '珈琲', '散歩'],
			tagline: '長い名前でもカードの幅は変わらないことを確かめるための1枚。',
		},
	},
	{
		id: 'long-tagline',
		label: 'tagline が上限ちょうど（120字）',
		data: {
			...BASE,
			tags: ['音楽', 'ギター', '作曲'],
			// 5行の折り返し制御と、Canvas 側の省略記号を確認する。ちょうど120文字。
			tagline:
				'鳴らした音を一音ずつ丁寧に選びながら、日々のちいさな気づきを言葉にして静かに置いていく人です。誰かの音にもまっすぐ耳を傾け、いいと思ったところを迷わず言葉にできる、あたたかくて芯のある観察者さん。しずかな夜ふけが、とてもよく似合う人柄です。',
		},
	},
	{
		id: 'overflow-tagline',
		label: 'tagline が上限超過（160字・省略記号の確認）',
		data: {
			...BASE,
			tags: ['長文', '上限超過', '省略'],
			// モデルが指示を無視して長く返したときに、5行目で「…」に落ちるかを見る。
			tagline:
				'鳴らした音を一音ずつ丁寧に選びながら、日々のちいさな気づきを言葉にして静かに置いていく人です。誰かの音にもまっすぐ耳を傾け、いいと思ったところを迷わず言葉にできる、あたたかくて芯のある観察者さん。しずかな夜ふけが、とてもよく似合う人柄です。ここから先は上限を超えた余分な文章なので、名刺の上では省略されるはずの部分です。',
		},
	},
	{
		id: 'no-tagline',
		label: 'tagline が空（comment フォールバック後の想定）',
		data: {
			...BASE,
			tags: ['料理', '園芸', '日記'],
			tagline: '',
		},
	},
	{
		id: 'no-tags',
		label: 'tags 無し（v1 プロンプト時代の既存行）',
		data: {
			...BASE,
			tags: [],
			tagline: 'タグ行が出ないぶん、下の余白がどう見えるかを確かめる1枚。',
		},
	},
	{
		id: 'no-avatar',
		label: 'アバター無し（イニシャル円）',
		data: {
			...BASE,
			avatar: undefined,
			tags: ['旅', '鉄道', '写真'],
			tagline: 'アバターが無いときのイニシャル円のフォールバックを見る1枚。',
		},
	},
	{
		id: 'avatar-square',
		label: 'アバターが正方形 512x512（本番と同じ形）',
		data: {
			...BASE,
			avatar: AVATARS.square,
			tags: ['正方形', '切り取り無し', '基準'],
			tagline: '正方形アバター。cover の切り取りが起きないときの基準の見え方。',
		},
	},
	{
		id: 'avatar-wide',
		label: 'アバターが極端な横長 1200x630',
		data: {
			...BASE,
			avatar: AVATARS.wide,
			tags: ['横長', 'cover検証', '左右が切れる'],
			tagline: '横長アバター。左右が対称に切り落とされ、上下にはズレないことを見る1枚。',
		},
	},
	{
		id: 'emoji',
		label: '絵文字・結合文字入り',
		data: {
			...BASE,
			displayName: '🌊 なぎ 👩‍👩‍👧‍👦 ✨',
			tags: ['🐈‍⬛くろねこ', '🎧音楽', '🍰おやつ'],
			tagline: '絵文字🌸や結合文字👨‍👩‍👧‍👦が混ざっても、折り返しが崩れないかを見る1枚です。',
		},
	},
	{
		id: 'english',
		label: '英語ロケール（tagsEn / taglineEn）',
		data: {
			...BASE,
			displayName: 'Sora Nagino',
			tags: ['CatPerson', 'NightOwlWriter', 'Photography'],
			tagline:
				'A gentle observer who scoops up the quiet of late nights with photographs and words.',
		},
	},
	{
		id: 'same-day',
		label: '登録日＝更新日（日付が並ぶとき）',
		data: {
			...BASE,
			joinedAt: '2026-07-28T01:00:00.000Z',
			updatedAt: '2026-07-28T09:30:00.000Z',
			tags: ['はじめまして', '自己紹介', 'これから'],
			tagline: '今日はじめた人の名刺。登録日と更新日が同じ月になる見え方を確認する。',
		},
	},
	{
		id: 'no-dates',
		label: '日付が両方とも無い',
		data: {
			...BASE,
			joinedAt: undefined,
			updatedAt: undefined,
			tags: ['謎', '無所属', '匿名'],
			tagline: '日付行そのものが消えたときにカードの下端が詰まりすぎないかを見る。',
		},
	},
];

/**
 * dev サーバーのポートは環境で変わるので、アバターと profileUrl は呼び出し時に
 * 実際のオリジンへ差し替える（QR を読んだ先が手元の dev サーバーになる）。
 */
export function cardFixtures(): CardFixture[] {
	return FIXTURES.map((fixture) => ({
		...fixture,
		data: {
			...fixture.data,
			// '/' 始まりのままだと AppView の blob プロキシ宛と解釈されるので、
			// static/ の実体を指す絶対 URL に直す（フィクスチャごとの画像を保つ）。
			avatar: fixture.data.avatar ? `${location.origin}${fixture.data.avatar}` : undefined,
			profileUrl: `${location.origin}/profile/${fixture.data.did}`,
		},
	}));
}
