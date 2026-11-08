/**
 * OGP 画像関数どうしで共有する取得・整形処理。
 * `_` 始まりのファイルは Vercel の関数として公開されない。
 */

export const APPVIEW_ORIGIN = 'https://nagi-api.suibari.com';
export const NAGI_ORIGIN = 'https://nagi.suibari.com';

export type FunctionRequest = {
	method?: string;
	query: Record<string, string | string[] | undefined>;
};

export type ImageFunctionResponse = {
	status(code: number): ImageFunctionResponse;
	setHeader(name: string, value: string): void;
	end(body?: Uint8Array): void;
};

export type OgpProfile = {
	did: string;
	handle: string;
	displayName?: string;
	description?: string;
	avatar?: string;
	comment?: string;
	tagline?: string;
	tags?: string[];
	joinedAt?: string;
	cardUpdatedAt?: string;
};

export const first = (value: string | string[] | undefined) =>
	Array.isArray(value) ? value[0] : value;

export const flatten = (value: string | undefined, limit = 120) => {
	const text = value?.replace(/\s+/g, ' ').trim() ?? '';
	return text.length <= limit ? text : `${text.slice(0, limit)}…`;
};

export async function appViewJson<T>(path: string): Promise<T> {
	const response = await fetch(`${APPVIEW_ORIGIN}${path}`, {
		headers: { Accept: 'application/json' },
		signal: AbortSignal.timeout(5_000),
	});
	if (!response.ok) throw new Error(`${path.split('?', 1)[0]} returned ${response.status}`);
	return (await response.json()) as T;
}

export async function getProfile(did: string): Promise<OgpProfile> {
	const query = new URLSearchParams({ actor: did, limit: '1', lang: 'ja' });
	const body = await appViewJson<{ profile?: OgpProfile }>(
		`/xrpc/com.suibari.nagi.getProfile?${query}`,
	);
	if (!body.profile) throw new Error('getProfile returned no profile');
	return body.profile;
}

export const absoluteAvatar = (avatar: string | undefined) =>
	// AppView のプロフィール画像は自前の blob proxy 相対URLだけを正規経路とする。
	// DB値を任意URLとして画像レンダラーに取得させない（SSRF 防止）。
	avatar?.startsWith('/api/blob/') ? `${APPVIEW_ORIGIN}${avatar}` : undefined;

export const initials = (profile: Pick<OgpProfile, 'displayName' | 'handle'>) =>
	(profile.displayName?.slice(0, 1) || profile.handle?.slice(0, 1).toUpperCase() || '○').slice(
		0,
		1,
	);

export function fallback(response: ImageFunctionResponse) {
	response.status(307);
	response.setHeader('Location', '/nagi_ogp.jpg');
	return response.end();
}

/**
 * ImageResponse の既定フォントは Regular しか持たず、太字指定が効かない。
 * カードに載る文字だけを Noto Sans JP からサブセット取得する（@vercel/og の動的読込と同じ方式）。
 * 取れなければ既定フォントで描く。
 */
async function loadFont(weight: 400 | 700, text: string) {
	const query = `family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(text)}`;
	const css = await fetch(`https://fonts.googleapis.com/css2?${query}`, {
		// TTF を返させるための古い Safari の UA。satori は WOFF2 を読めない。
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
		},
		signal: AbortSignal.timeout(5_000),
	}).then((response) => response.text());
	const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
	if (!url) throw new Error('font css has no TTF source');
	const font = await fetch(url, { signal: AbortSignal.timeout(5_000) });
	if (!font.ok) throw new Error(`font returned ${font.status}`);
	return { name: 'Noto Sans JP', data: await font.arrayBuffer(), weight, style: 'normal' as const };
}

export async function loadFonts(text: string) {
	try {
		return await Promise.all([loadFont(400, text), loadFont(700, text)]);
	} catch (error) {
		console.warn('Failed to load OGP fonts:', error);
		return undefined;
	}
}
