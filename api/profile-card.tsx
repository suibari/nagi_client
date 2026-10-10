import { ImageResponse } from '@vercel/og';
import React from 'react';
import {
	AVATAR_SIZE,
	BRAND_LOGO_HEIGHT,
	BRAND_LOGO_WIDTH,
	CARD_COLOR,
	CARD_HEIGHT,
	CARD_PADDING,
	CARD_WIDTH,
	CONTENT_COLUMN_X,
	QR_CONTAINER_RADIUS,
	QR_ICON_PADDING,
	QR_ICON_RADIUS,
	QR_ICON_SIZE,
	QR_SIZE,
	QR_X,
	QR_Y,
	TAGLINE_FONT_SIZE,
	TAGLINE_MAX_WIDTH,
} from '../src/lib/card/design.js';
import { qrRenderData } from '../src/lib/card/qr.js';
import { isSafeDid } from '../src/lib/og/html.js';
import {
	NAGI_ORIGIN,
	absoluteAvatar,
	fallback,
	first,
	flatten,
	getProfile,
	initials,
	type FunctionRequest,
	type ImageFunctionResponse,
} from './_ogp.js';
import { prepareOgpAvatar } from './_profile-card-image.js';

const date = (value: string | undefined) =>
	value
		? new Intl.DateTimeFormat('ja-JP', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				timeZone: 'Asia/Tokyo',
			}).format(new Date(value))
		: undefined;

export default async function handler(request: FunctionRequest, response: ImageFunctionResponse) {
	if (request.method !== 'GET' && request.method !== 'HEAD') return response.status(405).end();
	const did = first(request.query.did);
	if (!isSafeDid(did)) return fallback(response);

	try {
		const profile = await getProfile(did);
		const avatar = await prepareOgpAvatar(absoluteAvatar(profile.avatar));
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
		const profileUrl = `${NAGI_ORIGIN}/profile/${did}`;
		const qr = qrRenderData(profileUrl);
		const qrBoxSize = QR_SIZE + qr.quiet * 2;

		const image = new ImageResponse(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					position: 'relative',
					flexDirection: 'column',
					padding: `${CARD_PADDING}px`,
					fontFamily: 'sans-serif',
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
				<div style={{ display: 'flex', alignItems: 'center', height: AVATAR_SIZE }}>
					<div
						style={{
							width: AVATAR_SIZE,
							height: AVATAR_SIZE,
							borderRadius: AVATAR_SIZE / 2,
							border: `4px solid ${CARD_COLOR.accentSoft}`,
							background: CARD_COLOR.accentSoft,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							overflow: 'hidden',
							color: CARD_COLOR.accentStrong,
							fontSize: 88,
							fontWeight: 700,
							flexShrink: 0,
						}}
					>
						{avatar ? (
							<img
								src={avatar}
								width={AVATAR_SIZE}
								height={AVATAR_SIZE}
								style={{ objectFit: 'cover' }}
							/>
						) : (
							initials(profile)
						)}
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							marginLeft: CONTENT_COLUMN_X - CARD_PADDING - AVATAR_SIZE,
							minWidth: 0,
						}}
					>
						<div
							style={{
								fontSize: 52,
								fontWeight: 700,
								color: CARD_COLOR.textStrong,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								maxWidth: 780,
							}}
						>
							{profile.displayName || profile.handle}
						</div>
						<div style={{ fontSize: 28, color: CARD_COLOR.textMuted, marginTop: 6 }}>
							{`@${profile.handle}`}
						</div>
						{tags.length > 0 && (
							<div style={{ display: 'flex', marginTop: 14, gap: 14 }}>
								{tags.map((tag) => (
									<div
										key={tag}
										style={{
											display: 'flex',
											background: CARD_COLOR.accentSoft,
											color: CARD_COLOR.accentStrong,
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
						fontSize: TAGLINE_FONT_SIZE,
						lineHeight: 1.4,
						marginTop: 28,
						maxWidth: TAGLINE_MAX_WIDTH,
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
							color: CARD_COLOR.textMuted,
						}}
					>
						{dates}
					</div>
				)}
				<div
					style={{
						display: 'flex',
						position: 'absolute',
						left: QR_X - qr.quiet,
						top: QR_Y - qr.quiet,
						width: qrBoxSize,
						height: qrBoxSize,
						padding: qr.quiet,
						background: CARD_COLOR.bg,
						border: `2px solid ${CARD_COLOR.line}`,
						borderRadius: QR_CONTAINER_RADIUS,
					}}
				>
					<svg width={QR_SIZE} height={QR_SIZE} viewBox={`0 0 ${qr.modules} ${qr.modules}`}>
						<path d={qr.path} fill={CARD_COLOR.textStrong} />
					</svg>
					<div
						style={{
							display: 'flex',
							position: 'absolute',
							left: qr.quiet + (QR_SIZE - QR_ICON_SIZE) / 2 - QR_ICON_PADDING,
							top: qr.quiet + (QR_SIZE - QR_ICON_SIZE) / 2 - QR_ICON_PADDING,
							width: QR_ICON_SIZE + QR_ICON_PADDING * 2,
							height: QR_ICON_SIZE + QR_ICON_PADDING * 2,
							padding: QR_ICON_PADDING,
							borderRadius: QR_ICON_RADIUS,
							background: CARD_COLOR.bg,
						}}
					>
						<img src={`${NAGI_ORIGIN}/nagi_icon.png`} width={QR_ICON_SIZE} height={QR_ICON_SIZE} />
					</div>
				</div>
				<img
					src={`${NAGI_ORIGIN}/suibari_logo.png`}
					width={BRAND_LOGO_WIDTH}
					height={BRAND_LOGO_HEIGHT}
					style={{
						position: 'absolute',
						right: CARD_PADDING,
						bottom: CARD_PADDING,
						objectFit: 'contain',
					}}
				/>
			</div>,
			{
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				headers: {
					'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
					'Content-Disposition': `inline; filename="nagi-profile-${encodeURIComponent(did)}.png"`,
				},
			},
		);
		image.headers.forEach((value, key) => response.setHeader(key, value));
		response.status(image.status);
		if (request.method === 'HEAD') return response.end();
		return response.end(new Uint8Array(await image.arrayBuffer()));
	} catch (error) {
		console.error('Failed to generate profile OGP:', error);
		return fallback(response);
	}
}
