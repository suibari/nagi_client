import { ImageResponse } from '@vercel/og';
import React from 'react';
import { CARD_HEIGHT, CARD_WIDTH } from '../src/lib/card/design.js';
import { parseAdventDay } from '../src/lib/og/html.js';
import {
	NAGI_ORIGIN,
	absoluteAvatar,
	appViewJson,
	fallback,
	first,
	flatten,
	initials,
	loadFonts,
	type FunctionRequest,
	type ImageFunctionResponse,
} from './_ogp.js';
import { prepareOgpAvatar } from './_profile-card-image.js';

/**
 * アドカレのクリスマスカードの共有画像。アプリ内のカード（AdventCard.svelte）と同じ構図で、
 * 寸法は 1200x630 のときの値をそのまま px で持つ（アプリ側は cqw で同じ比率）。
 */

/** tokens.css の --advent-* と同じ値。共有画像は閲覧者のテーマに左右されない。 */
const ADVENT_COLOR = {
	bg: '#102a21',
	bg2: '#1b4535',
	pineDark: '#143d2e',
	gold: '#f3c96b',
	goldSoft: '#f7e2ad',
	cream: '#fff7e8',
	creamMuted: '#d8cfbf',
};

type AdventCard = {
	day: number;
	actor: { did: string; handle: string; displayName?: string; avatar?: string };
	titleJa: string;
	titleEn: string;
	commentJa: string;
	commentEn: string;
};

const PHOTO_WIDTH = CARD_WIDTH * 0.38;
const BOT_HEIGHT = Math.round(CARD_HEIGHT * 0.64);
/** static/advent/bot-santa.png の比率（420x519）。 */
const BOT_WIDTH = Math.round((BOT_HEIGHT * 420) / 519);

export default async function handler(request: FunctionRequest, response: ImageFunctionResponse) {
	if (request.method !== 'GET' && request.method !== 'HEAD') return response.status(405).end();
	const day = parseAdventDay(first(request.query.day));
	const year = Number(first(request.query.year));
	// シェアした人が英語で見ていれば、画像も英語にする。
	const en = first(request.query.lang) === 'en';
	if (!day || !Number.isInteger(year) || year < 2026 || year > 2100) return fallback(response);

	try {
		const calendar = await appViewJson<{ cards?: AdventCard[] }>(
			`/xrpc/com.suibari.nagi.getAdventCalendar?year=${year}`,
		);
		// まだ開いていない日は AppView が返さない。先回りした URL では中身を出さない。
		const card = calendar.cards?.find((item) => item.day === day);
		if (!card) return fallback(response);

		const avatar = await prepareOgpAvatar(absoluteAvatar(card.actor.avatar));
		const name = flatten(card.actor.displayName || card.actor.handle, 20);
		const handle = `@${flatten(card.actor.handle, 40)}`;
		const title = flatten(en ? card.titleEn : card.titleJa, en ? 60 : 30);
		const comment = flatten(en ? card.commentEn : card.commentJa, en ? 180 : 90);
		const date = `12.${String(day).padStart(2, '0')}`;
		const label = 'Nagi Advent Calendar';
		const fonts = await loadFonts([date, label, title, comment, '—', name, handle].join(''));

		const image = new ImageResponse(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					position: 'relative',
					fontFamily: fonts ? 'Noto Sans JP' : 'sans-serif',
					color: ADVENT_COLOR.cream,
					background: `linear-gradient(135deg, ${ADVENT_COLOR.bg} 40%, ${ADVENT_COLOR.bg2} 100%)`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						bottom: 0,
						width: PHOTO_WIDTH,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: ADVENT_COLOR.pineDark,
						color: ADVENT_COLOR.goldSoft,
						fontSize: 190,
						fontWeight: 700,
					}}
				>
					{avatar ? (
						<img
							src={avatar}
							width={PHOTO_WIDTH}
							height={CARD_HEIGHT}
							style={{ objectFit: 'cover' }}
						/>
					) : (
						initials(card.actor)
					)}
				</div>
				{/* 写真の右端をカードの地へ溶かす（satori は mask-image を持たない）。 */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						bottom: 0,
						width: PHOTO_WIDTH,
						display: 'flex',
						background: `linear-gradient(90deg, rgba(16,42,33,0) 55%, ${ADVENT_COLOR.bg} 100%)`,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						// satori は inset を持たない。
						top: 10,
						left: 10,
						right: 10,
						bottom: 10,
						display: 'flex',
						borderRadius: 18,
						border: `4px solid ${ADVENT_COLOR.gold}`,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: CARD_WIDTH * 0.4,
						right: 60,
						top: 66,
						bottom: 60,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'baseline',
							color: ADVENT_COLOR.gold,
							fontWeight: 700,
							fontSize: 23,
						}}
					>
						<div style={{ display: 'flex', fontSize: 31, marginRight: 14 }}>{date}</div>
						<div style={{ display: 'flex' }}>{label}</div>
					</div>
					<div
						style={{
							display: 'block',
							marginTop: 20,
							fontSize: title.length > (en ? 32 : 18) ? 48 : 55,
							fontWeight: 700,
							lineHeight: 1.3,
							lineClamp: 2,
							overflow: 'hidden',
							wordBreak: 'break-word',
						}}
					>
						{title}
					</div>
					<div
						style={{
							display: 'block',
							marginTop: 20,
							maxWidth: '60%',
							fontSize: en ? 24 : 26,
							lineHeight: 1.6,
							color: ADVENT_COLOR.creamMuted,
							lineClamp: 5,
							overflow: 'hidden',
							wordBreak: 'break-word',
						}}
					>
						{comment}
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'baseline',
							marginTop: 'auto',
							maxWidth: '60%',
							fontSize: 28,
						}}
					>
						<div style={{ display: 'flex', color: ADVENT_COLOR.gold, marginRight: 10 }}>—</div>
						<div style={{ display: 'flex', fontWeight: 700, marginRight: 10 }}>{name}</div>
						<div
							style={{
								display: 'flex',
								fontSize: 20,
								color: ADVENT_COLOR.creamMuted,
								overflow: 'hidden',
								whiteSpace: 'nowrap',
							}}
						>
							{handle}
						</div>
					</div>
				</div>
				<img
					src={`${NAGI_ORIGIN}/advent/bot-santa.png`}
					width={BOT_WIDTH}
					height={BOT_HEIGHT}
					style={{ position: 'absolute', right: 18, bottom: -6 }}
				/>
			</div>,
			{
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				fonts,
				headers: {
					// カードは選んだあと変わらない。名前・アバターの変更だけ、1日で追いつけばよい。
					'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
					'Content-Disposition': `inline; filename="nagi-advent-${year}-${day}${en ? '-en' : ''}.png"`,
				},
			},
		);
		image.headers.forEach((value, key) => response.setHeader(key, value));
		response.status(image.status);
		if (request.method === 'HEAD') return response.end();
		return response.end(new Uint8Array(await image.arrayBuffer()));
	} catch (error) {
		console.error('Failed to generate advent OGP:', error);
		return fallback(response);
	}
}
