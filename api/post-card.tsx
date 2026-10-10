import { ImageResponse } from '@vercel/og';
import React from 'react';
import { CARD_COLOR, CARD_HEIGHT, CARD_WIDTH } from '../src/lib/card/design.js';
import { isSafeDid, isSafeRkey } from '../src/lib/og/html.js';
import {
	NAGI_ORIGIN,
	absoluteAvatar,
	appViewJson,
	fallback,
	first,
	flatten,
	getProfile,
	initials,
	type FunctionRequest,
	type ImageFunctionResponse,
	type OgpProfile,
} from './_ogp.js';
import { prepareOgpAvatar } from './_profile-card-image.js';

type ThreadPost = {
	uri: string;
	text: string;
	author: Pick<OgpProfile, 'did' | 'handle' | 'displayName' | 'avatar'>;
	article?: boolean;
	deleted?: boolean;
	unavailableReason?: string;
	cwRestricted?: boolean;
	contentWarning?: unknown;
	kossori?: boolean;
	threadKossori?: boolean;
	selfLabels?: string[];
	moderationLabels?: string[];
};

const PADDING = 64;
const AVATAR = 96;
const BRAND_ICON = 64;
const POST_LINES = 4;

/** アプリの既定でぼかす自己ラベル（src/lib/moderation/preferences.svelte.ts と同じ）。 */
const NSFW_SELF_LABELS = new Set(['porn', 'sexual', 'nudity', 'graphic-media']);

/** 共有先のプレビューに出すと困る投稿は、本文の代わりに定型文だけを載せる。 */
const isPrivate = (post: ThreadPost) =>
	Boolean(
		post.deleted ||
		post.unavailableReason ||
		post.cwRestricted ||
		post.contentWarning ||
		post.selfLabels?.some((label) => NSFW_SELF_LABELS.has(label)) ||
		post.moderationLabels?.length,
	);

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

async function loadFonts(text: string) {
	try {
		return await Promise.all([loadFont(400, text), loadFont(700, text)]);
	} catch (error) {
		console.warn('Failed to load OGP fonts:', error);
		return undefined;
	}
}

/** `:bottan-nagi:` のような絵文字ショートコードは画像にできないので落とす。 */
const plain = (text: string) => text.replace(/:[a-z][a-z0-9_+-]*:/gi, '');

/** ポストは改行も文面の一部なので残し、空行と行内の連続空白だけを詰める。 */
function postBody(text: string, limit = 140, maxLines = POST_LINES) {
	const lines = plain(text)
		.split('\n')
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.filter(Boolean);
	// lineClamp が改行位置で切ると改行が欠け字形で描かれるので、行数はここで先に揃える。
	const body = lines.slice(0, maxLines).join('\n');
	if (body.length > limit) return `${body.slice(0, limit)}…`;
	return lines.length > maxLines ? `${body}…` : body;
}

function blogTitle(text: string) {
	const heading = /^\s*#\s+(.+)$/m.exec(text);
	const firstLine = text.trimStart().split('\n', 1)[0] ?? '';
	const title = heading && firstLine.startsWith('#') ? heading[1] : text;
	return flatten(plain(title).replace(/[*_~`]/g, ''), 80);
}

async function getPost(did: string, rkey: string, kind: 'post' | 'blog') {
	const collections =
		kind === 'blog'
			? ['site.standard.document', 'com.suibari.nagi.post']
			: ['com.suibari.nagi.post'];
	let lastError: unknown;
	for (const collection of collections) {
		const uri = `at://${did}/${collection}/${rkey}`;
		try {
			const body = await appViewJson<{ thread?: { post?: ThreadPost } }>(
				`/xrpc/com.suibari.nagi.getThread?uri=${encodeURIComponent(uri)}`,
			);
			if (body.thread?.post) return body.thread.post;
		} catch (error) {
			lastError = error;
		}
	}
	throw lastError ?? new Error('getThread returned no post');
}

export default async function handler(request: FunctionRequest, response: ImageFunctionResponse) {
	if (request.method !== 'GET' && request.method !== 'HEAD') return response.status(405).end();
	const did = first(request.query.did);
	const rkey = first(request.query.rkey);
	const kind = first(request.query.kind) === 'blog' ? 'blog' : 'post';
	if (!isSafeDid(did) || !isSafeRkey(rkey)) return fallback(response);

	try {
		const post = await getPost(did, rkey, kind);
		if (kind === 'blog' && (post.deleted || !post.article)) return fallback(response);
		// こっそり投稿は誰が書いたかも外へ出さず、サイト共通の画像に倒す。
		if (post.kossori || post.threadKossori) return fallback(response);
		const profile = await getProfile(post.author.did).catch(() => post.author as OgpProfile);
		const avatar = await prepareOgpAvatar(absoluteAvatar(profile.avatar));
		const tags = (profile.tags ?? []).slice(0, 3);
		const isBlog = kind === 'blog' || post.article === true;
		const hidden = isPrivate(post);
		const headline = hidden
			? isBlog
				? 'Nagiのブログ'
				: 'Nagiのポスト'
			: isBlog
				? blogTitle(post.text)
				: postBody(post.text);
		// CSS の省略記号は字形が欠けるので、はみ出す前に文字数で切る。
		const name = flatten(profile.displayName || profile.handle, 20);
		const handle = `@${profile.handle}`;
		const fonts = await loadFonts(
			['Nagi', 'ブログ', '…', headline, name, handle, ...tags.map((tag) => `#${tag}`)].join(''),
		);
		const headlineSize = isBlog ? (headline.length > 40 ? 60 : 72) : headline.length > 70 ? 46 : 54;

		const image = new ImageResponse(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					position: 'relative',
					flexDirection: 'column',
					padding: `${PADDING - 8}px ${PADDING}px ${PADDING - 8}px ${PADDING + 12}px`,
					fontFamily: fonts ? 'Noto Sans JP' : 'sans-serif',
					color: CARD_COLOR.text,
					background: `linear-gradient(135deg, ${CARD_COLOR.bg} 48%, ${CARD_COLOR.glow} 100%)`,
					border: `2px solid ${CARD_COLOR.line}`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						bottom: 0,
						width: 12,
						background: `linear-gradient(180deg, ${CARD_COLOR.accent}, ${CARD_COLOR.decorative})`,
					}}
				/>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<img src={`${NAGI_ORIGIN}/nagi_icon_trans.png`} width={BRAND_ICON} height={BRAND_ICON} />
					<div
						style={{
							display: 'flex',
							marginLeft: 10,
							fontSize: 40,
							fontWeight: 700,
							letterSpacing: 1,
							color: CARD_COLOR.accentStrong,
						}}
					>
						Nagi
					</div>
					{isBlog && (
						<div
							style={{
								display: 'flex',
								marginLeft: 20,
								padding: '4px 16px',
								borderRadius: 20,
								border: `2px solid ${CARD_COLOR.accentSoft}`,
								color: CARD_COLOR.accentStrong,
								fontSize: 22,
								fontWeight: 700,
							}}
						>
							ブログ
						</div>
					)}
				</div>
				<div style={{ display: 'flex', flex: 1, alignItems: 'center', minHeight: 0 }}>
					<div
						style={{
							display: 'block',
							width: '100%',
							fontSize: headlineSize,
							fontWeight: isBlog ? 700 : 400,
							lineHeight: 1.4,
							color: CARD_COLOR.textStrong,
							lineClamp: isBlog ? 3 : POST_LINES,
							overflow: 'hidden',
							// satori は break-all だと改行を空白扱いにする。
							wordBreak: 'break-word',
							whiteSpace: isBlog ? 'normal' : 'pre-wrap',
						}}
					>
						{headline}
					</div>
				</div>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<div
						style={{
							width: AVATAR,
							height: AVATAR,
							borderRadius: AVATAR / 2,
							border: `3px solid ${CARD_COLOR.accentSoft}`,
							background: CARD_COLOR.accentSoft,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							overflow: 'hidden',
							color: CARD_COLOR.accentStrong,
							fontSize: 40,
							fontWeight: 700,
							flexShrink: 0,
						}}
					>
						{avatar ? (
							<img src={avatar} width={AVATAR} height={AVATAR} style={{ objectFit: 'cover' }} />
						) : (
							initials(profile)
						)}
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							marginLeft: 20,
							minWidth: 0,
							flex: 1,
						}}
					>
						<div style={{ display: 'flex', alignItems: 'baseline', minWidth: 0 }}>
							<div
								style={{
									fontSize: 30,
									fontWeight: 700,
									color: CARD_COLOR.textStrong,
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									maxWidth: 640,
								}}
							>
								{name}
							</div>
							<div
								style={{
									fontSize: 22,
									color: CARD_COLOR.textMuted,
									marginLeft: 14,
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									maxWidth: 320,
								}}
							>
								{handle}
							</div>
						</div>
						{tags.length > 0 && (
							<div style={{ display: 'flex', marginTop: 10, gap: 10 }}>
								{tags.map((tag) => (
									<div
										key={tag}
										style={{
											display: 'flex',
											background: CARD_COLOR.accentSoft,
											color: CARD_COLOR.accentStrong,
											borderRadius: 18,
											padding: '4px 14px',
											fontSize: 20,
											fontWeight: 700,
										}}
									>
										{`#${tag}`}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>,
			{
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				fonts,
				headers: {
					'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
					'Content-Disposition': `inline; filename="nagi-${kind}-${encodeURIComponent(rkey)}.png"`,
				},
			},
		);
		image.headers.forEach((value, key) => response.setHeader(key, value));
		response.status(image.status);
		if (request.method === 'HEAD') return response.end();
		return response.end(new Uint8Array(await image.arrayBuffer()));
	} catch (error) {
		console.error('Failed to generate post OGP:', error);
		return fallback(response);
	}
}
