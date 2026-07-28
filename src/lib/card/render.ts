import { APPVIEW_URL } from '$lib/api/appview';
import { dateLocale, m } from '$lib/i18n/i18n.svelte';
import type { BusinessCardData } from './data';
import { qrMatrix } from './qr';

/**
 * 名刺カードを PNG 画像として描く。
 *
 * nagi_client は adapter-static の完全 SPA でサーバーランタイムが無いため、画像生成は
 * ブラウザの Canvas で行う。共有先（Bluesky / Nagi のタイムライン）で切れにくいよう
 * OGP と同じ 1200x630 に固定する。
 *
 * ⚠ この関数は BusinessCard.svelte（DOM 版）と同じ見た目を手で再現している。片方だけ
 *    直すとズレるので、レイアウトを変えるときは必ず両方を直し、/dev/name-card で並べて確認すること。
 *    ただし、QR と suibari.com のブランドロゴは共有用の PNG 版にだけ描画する。
 *
 * ⚠ テーマは追従させない。共有された画像は相手のテーマで見られるので、
 *    閲覧者ごとに色が変わると「送ったものと違う絵」になる。ライト基調で固定する。
 */

const W = 1200;
const H = 630;
const PAD = 64;

/** アバターが主役。右側に名前・ハンドル・タグを積んで、その3行と高さを釣り合わせる。 */
const AVATAR_SIZE = 224;
/** アバター右の列の開始 x。 */
const COL_X = PAD + AVATAR_SIZE + 40;
/**
 * QR は 49 モジュール（プロフィール URL の長さ + ecc=high での実測）。200px なら
 * 1モジュール約4pxで、写真に撮っても読める大きさになる。小さくしすぎると潰れる。
 */
const QR_SIZE = 200;
/** 右下のブランドロゴ。透明余白を除いた画像の比率（737:158）を維持する。 */
const BRAND_LOGO_WIDTH = 280;
const BRAND_LOGO_HEIGHT = (BRAND_LOGO_WIDTH * 158) / 737;
/** アバター下端(PAD + AVATAR_SIZE = 288)より下から始める。 */
const TAGLINE_TOP = 316;
/**
 * tagline は最大120文字。この幅(840px)ではフォント30pxで約28文字/行なので5行あれば収まる。
 * 行数・字送りを変えるときは、最終行が日付行(y=566)に重ならないか必ず計算し直すこと。
 */
const TAGLINE_FONT_SIZE = 30;
const TAGLINE_LINE_HEIGHT = 42;
const TAGLINE_MAX_LINES = 5;

/** tokens.css のライトテーマ相当。画像は固定テーマなので値を直接持つ。 */
const COLOR = {
	bg: '#ffffff',
	glow: '#dffbfc',
	text: '#2f3542',
	textStrong: '#202632',
	textMuted: '#747d8c',
	line: '#d5e5e7',
	accent: '#00ced1',
	accentStrong: '#007b7e',
	accentSoft: '#c9f7f7',
	decorative: '#ff9ff3',
} as const;

const FONT_STACK =
	'"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", system-ui, sans-serif';

const font = (size: number, weight: 400 | 600 | 700 = 400) => `${weight} ${size}px ${FONT_STACK}`;

export async function renderBusinessCard(data: BusinessCardData): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('canvas is unavailable');

	// Web フォントの読み込み前に描くと measureText がフォールバック幅を返し、
	// 折り返し位置が実際の描画とズレる。
	await document.fonts.ready;

	drawBackground(ctx);
	const avatar = await loadAvatar(data.avatar);
	drawAvatar(ctx, avatar, data);
	const rows = headRows(data.tags.length > 0);
	drawNames(ctx, data, rows);
	drawTags(ctx, data.tags, rows);
	drawTagline(ctx, data.tagline);
	drawDates(ctx, data);
	await drawQr(ctx, data.profileUrl);
	await drawBrandLogo(ctx);

	return await toBlob(canvas);
}

function drawBackground(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = COLOR.bg;
	ctx.fillRect(0, 0, W, H);

	// 右上から差す淡いブランドグラデーション。名刺の「表面」らしさを出すだけの飾り。
	const glow = ctx.createLinearGradient(W, 0, W * 0.45, H);
	glow.addColorStop(0, COLOR.glow);
	glow.addColorStop(1, COLOR.bg);
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, W, H);

	// 左端のブランドバー。
	const bar = ctx.createLinearGradient(0, 0, 0, H);
	bar.addColorStop(0, COLOR.accent);
	bar.addColorStop(1, COLOR.decorative);
	ctx.fillStyle = bar;
	ctx.fillRect(0, 0, 12, H);

	ctx.strokeStyle = COLOR.line;
	ctx.lineWidth = 2;
	ctx.strokeRect(1, 1, W - 2, H - 2);
}

/**
 * アバターを読む。AppView の blob プロキシは別オリジンなので、crossOrigin を付けないと
 * canvas が汚染されて toBlob が SecurityError になる（/api/blob には CORS が効いている）。
 * 読めなかったときは undefined を返し、DOM 版と同じイニシャル円にフォールバックする。
 */
async function loadAvatar(avatar: string | undefined): Promise<HTMLImageElement | undefined> {
	if (!avatar) return undefined;
	const src = avatar.startsWith('/') ? APPVIEW_URL + avatar : avatar;
	return await new Promise<HTMLImageElement | undefined>((resolve) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = () => resolve(undefined);
		img.src = src;
	});
}

function drawAvatar(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement | undefined,
	data: BusinessCardData,
) {
	const r = AVATAR_SIZE / 2;
	const cx = PAD + r;
	const cy = PAD + r;

	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();
	if (img) {
		// アスペクト比を保ったまま円を埋める（CSS の object-fit: cover 相当）。
		const scale = Math.max(AVATAR_SIZE / img.width, AVATAR_SIZE / img.height);
		const w = img.width * scale;
		const h = img.height * scale;
		ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
	} else {
		ctx.fillStyle = COLOR.accentSoft;
		ctx.fillRect(PAD, PAD, AVATAR_SIZE, AVATAR_SIZE);
		ctx.fillStyle = COLOR.accentStrong;
		// DOM 版の .business-card .avatar は 92px / font-size 36px。同じ比率にする。
		ctx.font = font(Math.round(AVATAR_SIZE * 0.39), 700);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(initialOf(data), cx, cy + 4);
	}
	ctx.restore();

	ctx.strokeStyle = COLOR.accentSoft;
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.stroke();
}

/** Avatar.svelte と同じフォールバック規則。 */
const initialOf = (data: { displayName?: string; handle?: string }) =>
	data.displayName?.slice(0, 1) ?? data.handle?.slice(0, 1)?.toUpperCase() ?? '○';

/**
 * アバター右の3行（名前・ハンドル・タグ）の縦位置。
 * DOM 版は `align-items: center` なので、こちらもアバターの中心に対して積み木ごと
 * centering する。上端揃えにすると DOM と見比べたときにズレる。
 */
function headRows(hasTags: boolean) {
	const NAME_H = 56;
	const HANDLE_H = 36;
	const TAGS_H = 48;
	const GAP = 10;
	const blockHeight = NAME_H + GAP + HANDLE_H + (hasTags ? GAP + TAGS_H : 0);
	const top = PAD + (AVATAR_SIZE - blockHeight) / 2;
	return {
		nameBaseline: top + 42,
		handleBaseline: top + NAME_H + GAP + 27,
		tagsTop: top + NAME_H + GAP + HANDLE_H + GAP,
		tagsHeight: TAGS_H,
	};
}

type HeadRows = ReturnType<typeof headRows>;

function drawNames(ctx: CanvasRenderingContext2D, data: BusinessCardData, rows: HeadRows) {
	const maxWidth = W - PAD - COL_X;

	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';

	ctx.fillStyle = COLOR.textStrong;
	ctx.font = font(52, 700);
	ctx.fillText(ellipsize(ctx, data.displayName || data.handle, maxWidth), COL_X, rows.nameBaseline);

	ctx.fillStyle = COLOR.textMuted;
	ctx.font = font(28);
	ctx.fillText(ellipsize(ctx, `@${data.handle}`, maxWidth), COL_X, rows.handleBaseline);
}

/** 名前・ハンドルの下、アバターの右横に並べる。 */
function drawTags(ctx: CanvasRenderingContext2D, tags: string[], rows: HeadRows) {
	if (!tags.length) return;
	const y = rows.tagsTop;
	const height = rows.tagsHeight;
	const padX = 22;
	let x = COL_X;

	ctx.font = font(26, 600);
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	for (const tag of tags) {
		const label = `#${tag}`;
		const width = ctx.measureText(label).width + padX * 2;
		// 3つでも収まらないほど長いタグが来たら、はみ出す前に打ち切る。
		if (x + width > W - PAD) break;
		roundRect(ctx, x, y, width, height, height / 2);
		ctx.fillStyle = COLOR.accentSoft;
		ctx.fill();
		ctx.fillStyle = COLOR.accentStrong;
		ctx.fillText(label, x + padX, y + height / 2 + 1);
		x += width + 14;
	}
}

function drawTagline(ctx: CanvasRenderingContext2D, tagline: string) {
	// QR と重ならない幅で折り返す。
	const maxWidth = W - PAD - QR_SIZE - PAD - 32;
	ctx.fillStyle = COLOR.text;
	ctx.font = font(TAGLINE_FONT_SIZE);
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';

	const lines = wrapText(ctx, tagline, maxWidth, TAGLINE_MAX_LINES);
	lines.forEach((line, i) => {
		ctx.fillText(line, PAD, TAGLINE_TOP + TAGLINE_FONT_SIZE + i * TAGLINE_LINE_HEIGHT);
	});
}

function drawDates(ctx: CanvasRenderingContext2D, data: BusinessCardData) {
	const parts: string[] = [];
	if (data.joinedAt) parts.push(m.nameCardJoinedAt({ date: formatDate(data.joinedAt) }));
	if (data.updatedAt) parts.push(m.nameCardUpdatedAt({ date: formatDate(data.updatedAt) }));
	if (!parts.length) return;

	ctx.fillStyle = COLOR.textMuted;
	ctx.font = font(24);
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(parts.join('　・　'), PAD, H - PAD);
}

async function drawQr(ctx: CanvasRenderingContext2D, url: string) {
	const matrix = qrMatrix(url);
	const x = W - PAD - QR_SIZE;
	// 右下のブランドロゴとクワイエットゾーンが重ならない位置まで上げる。
	const y = H - PAD - QR_SIZE - 88;
	const modules = matrix.length;
	const cell = QR_SIZE / modules;

	// QR の周りに白い余白（クワイエットゾーン）が無いと読み取れない。
	// 規格が要求するのは4モジュールぶんなので、px 直値ではなくセル幅から出す。
	const quiet = cell * 4;
	roundRect(ctx, x - quiet, y - quiet, QR_SIZE + quiet * 2, QR_SIZE + quiet * 2, 16);
	ctx.fillStyle = '#ffffff';
	ctx.fill();
	ctx.strokeStyle = COLOR.line;
	ctx.lineWidth = 2;
	ctx.stroke();

	ctx.fillStyle = COLOR.textStrong;
	for (let row = 0; row < modules; row++) {
		for (let col = 0; col < modules; col++) {
			if (!matrix[row][col]) continue;
			// 隣接セルの隙間を無くすため切り上げる。
			ctx.fillRect(x + col * cell, y + row * cell, Math.ceil(cell), Math.ceil(cell));
		}
	}

	// 中央の Nagi アイコン。誤り訂正 high なのでこの程度の欠損は復元できる。
	const icon = await loadIcon();
	if (!icon) return;
	const iconBox = QR_SIZE * 0.26;
	const ix = x + (QR_SIZE - iconBox) / 2;
	const iy = y + (QR_SIZE - iconBox) / 2;
	roundRect(ctx, ix - 6, iy - 6, iconBox + 12, iconBox + 12, 10);
	ctx.fillStyle = '#ffffff';
	ctx.fill();
	ctx.drawImage(icon, ix, iy, iconBox, iconBox);
}

async function drawBrandLogo(ctx: CanvasRenderingContext2D) {
	const logo = await loadStaticImage('/suibari_logo.png');
	if (!logo) return;
	ctx.drawImage(
		logo,
		W - PAD - BRAND_LOGO_WIDTH,
		H - PAD - BRAND_LOGO_HEIGHT,
		BRAND_LOGO_WIDTH,
		BRAND_LOGO_HEIGHT,
	);
}

/** static/ 配信の画像は同一オリジンなので canvas を汚染しない。 */
async function loadStaticImage(src: string): Promise<HTMLImageElement | undefined> {
	return await new Promise<HTMLImageElement | undefined>((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => resolve(undefined);
		img.src = src;
	});
}

const loadIcon = () => loadStaticImage('/nagi_icon.png');

/**
 * 日本語には単語境界が無いので、CSS のような自動折り返しが使えない。
 * 空白があれば単語単位、無ければ1文字ずつ詰めて幅で折る。
 */
function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxLines: number,
): string[] {
	const lines: string[] = [];
	let line = '';
	for (const char of Array.from(text)) {
		const candidate = line + char;
		if (ctx.measureText(candidate).width <= maxWidth) {
			line = candidate;
			continue;
		}
		if (lines.length === maxLines - 1) {
			// 最終行に到達。入るところまで入れて省略記号で締める。
			lines.push(ellipsize(ctx, candidate, maxWidth));
			return lines;
		}
		lines.push(line);
		line = char;
	}
	if (line) lines.push(line);
	return lines;
}

/** 幅に収まらなければ末尾を削って「…」を付ける。 */
function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
	if (ctx.measureText(text).width <= maxWidth) return text;
	const chars = Array.from(text);
	while (chars.length > 1) {
		chars.pop();
		const candidate = `${chars.join('')}…`;
		if (ctx.measureText(candidate).width <= maxWidth) return candidate;
	}
	return '…';
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

// 画像の色はテーマ非追従で固定するが、日付と文言は作った本人の言語に合わせる
// （名刺を書き出すのは常に閲覧者自身なので、その人の読める表記が正しい）。
const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString(dateLocale(), {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			// アバターの CORS 設定が外れると toBlob が null を返す（canvas 汚染）。
			// 静かに握り潰すと「保存を押しても何も起きない」になるので必ず投げる。
			if (blob) resolve(blob);
			else reject(new Error('failed to encode the card image'));
		}, 'image/png');
	});
}
