const DID_PATTERN = /^did:[a-z0-9]+:[A-Za-z0-9._:%-]+$/;
const RKEY_PATTERN = /^[A-Za-z0-9._:~-]{1,512}$/;

export function isSafeDid(value: unknown): value is string {
	return typeof value === 'string' && value.length <= 256 && DID_PATTERN.test(value);
}

export function isSafeRkey(value: unknown): value is string {
	return typeof value === 'string' && value !== '.' && value !== '..' && RKEY_PATTERN.test(value);
}

const escapeAttribute = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');

function replaceMeta(html: string, selector: 'property' | 'name', key: string, content: string) {
	const pattern = new RegExp(
		`<meta\\s+${selector}=["']${key.replace(':', '\\:')}["']\\s+content=["'][^"']*["']\\s*/?>`,
		'i',
	);
	const meta = `<meta ${selector}="${key}" content="${escapeAttribute(content)}" />`;
	return pattern.test(html)
		? html.replace(pattern, meta)
		: html.replace('</head>', `\t\t${meta}\n\t</head>`);
}

export type PostCardKind = 'post' | 'blog';

function withImageMeta(html: string, image: string, alt: string) {
	let output = replaceMeta(html, 'property', 'og:image', image);
	output = replaceMeta(output, 'property', 'og:image:type', 'image/png');
	output = replaceMeta(output, 'property', 'og:image:alt', alt);
	output = replaceMeta(output, 'name', 'twitter:image', image);
	return replaceMeta(output, 'name', 'twitter:image:alt', alt);
}

/**
 * adapter-static が作った SPA shell は全URLで同一なので、動的ページだけ画像メタを差し替える。
 * script を足さないため、SvelteKit が生成した CSP hash は変更不要。
 */
export function withProfileCardMeta(html: string, did: string) {
	// v2 は WebP アバターを直接埋め込んでいた旧画像の長期キャッシュを回避する。
	const image = `https://nagi.suibari.com/api/profile-card?v=2&did=${encodeURIComponent(did)}`;
	return withImageMeta(html, image, 'Nagiのプロフィールカード');
}

/**
 * standard.site の記事ページであることを示す。Bluesky は投稿欄に貼られた URL の HTML から
 * これを読み、document と publication の強参照を投稿へ埋めて記事カードで表示する。
 */
function withStandardSiteDocumentLink(html: string, did: string, rkey: string) {
	const href = escapeAttribute(`at://${did}/site.standard.document/${rkey}`);
	return html.replace(
		'</head>',
		`\t\t<link rel="site.standard.document" href="${href}" />\n\t</head>`,
	);
}

/** ポスト・ブログの共有リンクには、本文やタイトルを載せた専用カードを出す。 */
export function withPostCardMeta(html: string, did: string, rkey: string, kind: PostCardKind) {
	const query = new URLSearchParams({ v: '1', kind, did, rkey });
	const image = `https://nagi.suibari.com/api/post-card?${query}`;
	if (kind === 'post') return withImageMeta(html, image, 'Nagiのポスト');
	return withStandardSiteDocumentLink(withImageMeta(html, image, 'Nagiのブログ'), did, rkey);
}

/**
 * アドカレのカードのリンク（/advent?day=N）。画像はその日のカードそのもの。
 * 本文は AppView を引かずに作れる範囲（日付）だけにする。
 */
export function withAdventCardMeta(
	html: string,
	day: number | undefined,
	year: number,
	lang: 'ja' | 'en' = 'ja',
) {
	const en = lang === 'en';
	const title = en
		? day
			? `Nagi Advent Calendar: the card for December ${day}`
			: 'Nagi Advent Calendar'
		: day
			? `Nagiアドベントカレンダー 12月${day}日のカード`
			: 'Nagiアドベントカレンダー';
	const description = en
		? 'Each day Bot-tan picks one happy thing from everyone’s posts and turns it into a Christmas card.'
		: 'botたんがみんなのポストから嬉しいものを毎日ひとつ選んで、クリスマスカードにして届けるよ。';
	let output = replaceMeta(html, 'property', 'og:title', title);
	output = replaceMeta(output, 'property', 'og:description', description);
	output = replaceMeta(output, 'name', 'description', description);
	if (!day) return output;
	const query = new URLSearchParams({
		v: '2',
		year: String(year),
		day: String(day),
		...(en ? { lang: 'en' } : {}),
	});
	return withImageMeta(output, `https://nagi.suibari.com/api/advent-card?${query}`, title);
}

/** `?day=` の読み取り。1〜25 以外は無視する。 */
export function parseAdventDay(value: unknown): number | undefined {
	if (typeof value !== 'string' || !/^\d{1,2}$/.test(value)) return undefined;
	const day = Number(value);
	return day >= 1 && day <= 25 ? day : undefined;
}

/** カードの年（JST）。1月のうちは前年のカレンダーを指す。 */
export function adventYearAt(now = Date.now()): number {
	const date = new Date(now + 9 * 60 * 60_000);
	return date.getUTCMonth() === 0 ? date.getUTCFullYear() - 1 : date.getUTCFullYear();
}
