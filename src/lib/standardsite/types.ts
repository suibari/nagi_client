export const PUBLICATION = 'site.standard.publication';
export const DOCUMENT = 'site.standard.document';
/** markdown を document.content の open union に載せるための lexicon（markpub.at）。 */
export const MARKDOWN = 'at.markpub.markdown';
export const MARKDOWN_TEXT = 'at.markpub.text';

/**
 * publication.url は「document.path と連結して canonical URL を作るためのベース」と
 * lexicon に明記されている。ユーザーごとの publication でも url は Nagi 本体で共通にし、
 * name / description / icon で個人を表す。ローカル開発でも本番の公開 URL を書く
 * （レコードは恒久的で、localhost を指しても意味がないため）。
 */
export const NAGI_PUBLIC_ORIGIN = 'https://nagi.suibari.com';

/**
 * ユーザーごとの publication.url。standard.site の検証は url の
 * `/.well-known/site.standard.publication`（パス付きならその後ろにパス）を引くので、
 * 全員で同じ url を共有すると1件しか答えられない。ユーザーごとのパスにして、
 * `/.well-known/site.standard.publication/blog/<did>` で各自の publication を返す。
 * document.path はこの url からの相対（`/<rkey>`）になり、canonical URL は従来と同じ
 * `/blog/<did>/<rkey>` のまま変わらない。
 */
export const nagiPublicationUrl = (did: string) => `${NAGI_PUBLIC_ORIGIN}/blog/${did}`;

/** 移行前の publication.url（全員共通のオリジン）。読み取りでは引き続き Nagi のものと認める。 */
export const LEGACY_PUBLICATION_URL = NAGI_PUBLIC_ORIGIN;

export type StandardSitePreferences = { showInDiscover?: boolean };

const rgb = (r: number, g: number, b: number) => ({
	$type: 'site.standard.theme.color#rgb',
	r,
	g,
	b,
});

/**
 * publication.basicTheme。Bluesky の記事カードはボタンに accent / accentForeground を使い、
 * 両者のコントラスト比が 4.5 未満だと黙って既定色へ戻す。Nagi の主ボタン
 * （tokens.css の --accent / --text-on-accent、比は約6.3）と同じ組み合わせにしている。
 * background / foreground はカードではまだ使われないが、lexicon 上は必須。
 */
export const NAGI_BASIC_THEME = {
	$type: 'site.standard.theme.basic',
	background: rgb(0xf7, 0xf9, 0xf9),
	foreground: rgb(0x2f, 0x35, 0x42),
	accent: rgb(0x00, 0xce, 0xd1),
	accentForeground: rgb(0x14, 0x38, 0x3d),
};

type ThemeColor = { r?: unknown; g?: unknown; b?: unknown };

/**
 * PDS から読んだ basicTheme が Nagi の配色か。DAG-CBOR はキー順を並べ替えて返すので、
 * JSON 文字列ではなく色の値で比べる。
 */
export function hasNagiTheme(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false;
	const theme = value as Record<string, ThemeColor | undefined>;
	return (['background', 'foreground', 'accent', 'accentForeground'] as const).every((key) => {
		const actual = theme[key];
		const expected = NAGI_BASIC_THEME[key];
		return actual?.r === expected.r && actual?.g === expected.g && actual?.b === expected.b;
	});
}

export type StandardSitePublication = {
	$type?: string;
	url: string;
	name: string;
	description?: string;
	icon?: unknown;
	basicTheme?: unknown;
	preferences?: StandardSitePreferences;
};

export type StandardSiteDocument = {
	$type?: string;
	site: string;
	title: string;
	publishedAt: string;
	updatedAt?: string;
	path?: string;
	description?: string;
	textContent?: string;
	content?: unknown;
	coverImage?: unknown;
	tags?: string[];
	/** コメントを追える Bluesky 投稿。Nagi ではティーザー投稿を指す。 */
	bskyPostRef?: { uri: string; cid: string };
};

/** 投稿1件を standard.site の記事として書き出すための入力。 */
export type ArticleInput = {
	/**
	 * Nagi のリッチテキスト・添付。正本の文書内に保存する。
	 * 原文の text は buildRecord が markdown から入れる（facet の位置はこの原文が基準）。
	 */
	nagi?: {
		facets?: unknown;
		langs?: string[];
		embed?: unknown;
		linkCards?: unknown;
		botSilent?: boolean;
	};
	labels?: unknown;
	/** Nagi 投稿の rkey。document の rkey にもそのまま使う。 */
	rkey: string;
	title: string;
	/** 生の markdown（Nagi 投稿の text そのもの）。 */
	markdown: string;
	publishedAt: string;
	/**
	 * 記事のタグ。省略すると、既存レコードのタグをそのまま残す
	 * （本文編集での追従がタグを消してしまわないようにするため）。
	 */
	tags?: string[];
	/** 1枚目の画像の BlobRef。1MB 以下のときだけ渡す。 */
	coverImage?: unknown;
	/** Bluesky へティーザーを出したときだけ、その投稿への強参照。 */
	bskyPostRef?: { uri: string; cid: string };
};
