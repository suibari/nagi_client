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
