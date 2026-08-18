import { ImageResponse } from '@vercel/og';
import React from 'react';
import { isSafeDid } from '../src/lib/og/html.js';

type Profile = {
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

const APPVIEW_ORIGIN = 'https://nagi-api.suibari.com';
const NAGI_ORIGIN = 'https://nagi.suibari.com';

const flatten = (value: string | undefined, limit = 120) => {
	const text = value?.replace(/\s+/g, ' ').trim() ?? '';
	return text.length <= limit ? text : `${text.slice(0, limit)}…`;
};

const date = (value: string | undefined) =>
	value
		? new Intl.DateTimeFormat('ja-JP', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				timeZone: 'Asia/Tokyo',
			}).format(new Date(value))
		: undefined;

async function getProfile(did: string): Promise<Profile> {
	const query = new URLSearchParams({ actor: did, limit: '1', lang: 'ja' });
	const response = await fetch(`${APPVIEW_ORIGIN}/xrpc/com.suibari.nagi.getProfile?${query}`, {
		headers: { Accept: 'application/json' },
		signal: AbortSignal.timeout(5_000),
	});
	if (!response.ok) throw new Error(`getProfile returned ${response.status}`);
	const body = (await response.json()) as { profile?: Profile };
	if (!body.profile) throw new Error('getProfile returned no profile');
	return body.profile;
}

const absoluteAvatar = (avatar: string | undefined) =>
	// AppView のプロフィール画像は自前の blob proxy 相対URLだけを正規経路とする。
	// DB値を任意URLとして画像レンダラーに取得させない（SSRF 防止）。
	avatar?.startsWith('/api/blob/') ? `${APPVIEW_ORIGIN}${avatar}` : undefined;

const initials = (profile: Profile) =>
	(profile.displayName?.slice(0, 1) || profile.handle?.slice(0, 1).toUpperCase() || '○').slice(
		0,
		1,
	);

function fallback(request: Request) {
	return Response.redirect(new URL('/nagi_ogp.jpg', request.url), 307);
}

export default async function handler(request: Request) {
	if (request.method !== 'GET' && request.method !== 'HEAD')
		return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
	const did = new URL(request.url).searchParams.get('did');
	if (!isSafeDid(did)) return fallback(request);

	try {
		const profile = await getProfile(did);
		const avatar = absoluteAvatar(profile.avatar);
		const tags = (profile.tags ?? []).slice(0, 3);
		const tagline =
			flatten(profile.tagline) ||
			flatten(profile.comment) ||
			flatten(profile.description) ||
			'Nagiで過ごしているユーザーです。';
		const joined = date(profile.joinedAt);
		const updated = date(profile.cardUpdatedAt);
		const dates = [joined ? `Nagi登録 ${joined}` : '', updated ? `更新 ${updated}` : '']
			.filter(Boolean)
			.join('　・　');

		return new ImageResponse(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					position: 'relative',
					flexDirection: 'column',
					padding: '64px',
					fontFamily: 'sans-serif',
					color: '#2f3542',
					background: 'linear-gradient(135deg, #ffffff 48%, #dffbfc 100%)',
					border: '2px solid #d5e5e7',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						bottom: 0,
						width: 12,
						background: 'linear-gradient(180deg, #00ced1, #ff9ff3)',
					}}
				/>
				<div style={{ display: 'flex', alignItems: 'center', height: 224 }}>
					<div
						style={{
							width: 224,
							height: 224,
							borderRadius: 112,
							border: '4px solid #c9f7f7',
							background: '#c9f7f7',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							overflow: 'hidden',
							color: '#007b7e',
							fontSize: 88,
							fontWeight: 700,
							flexShrink: 0,
						}}
					>
						{avatar ? (
							<img src={avatar} width={224} height={224} style={{ objectFit: 'cover' }} />
						) : (
							initials(profile)
						)}
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							marginLeft: 40,
							minWidth: 0,
						}}
					>
						<div
							style={{
								fontSize: 52,
								fontWeight: 700,
								color: '#202632',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								maxWidth: 780,
							}}
						>
							{profile.displayName || profile.handle}
						</div>
						<div style={{ fontSize: 28, color: '#747d8c', marginTop: 6 }}>
							{`@${profile.handle}`}
						</div>
						{tags.length > 0 && (
							<div style={{ display: 'flex', marginTop: 14, gap: 14 }}>
								{tags.map((tag) => (
									<div
										key={tag}
										style={{
											display: 'flex',
											background: '#c9f7f7',
											color: '#007b7e',
											borderRadius: 24,
											padding: '8px 20px',
											fontSize: 26,
											fontWeight: 600,
										}}
									>
										{`#${tag}`}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
				<div
					style={{
						display: 'flex',
						fontSize: 30,
						lineHeight: 1.4,
						marginTop: 28,
						maxWidth: 850,
						whiteSpace: 'pre-wrap',
					}}
				>
					{tagline}
				</div>
				{dates && (
					<div
						style={{
							display: 'flex',
							position: 'absolute',
							left: 64,
							bottom: 58,
							fontSize: 24,
							color: '#747d8c',
						}}
					>
						{dates}
					</div>
				)}
				<img
					src={`${NAGI_ORIGIN}/suibari_logo.png`}
					width={280}
					height={60}
					style={{ position: 'absolute', right: 64, bottom: 50, objectFit: 'contain' }}
				/>
			</div>,
			{
				width: 1200,
				height: 630,
				headers: {
					'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
					'Content-Disposition': `inline; filename="nagi-profile-${encodeURIComponent(did)}.png"`,
				},
			},
		);
	} catch (error) {
		console.error('Failed to generate profile OGP:', error);
		return fallback(request);
	}
}
