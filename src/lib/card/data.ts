import type { ProfileDetail } from '$lib/api/types';

/**
 * 名刺カード1枚を描くのに必要な、すべてのデータ。
 *
 * DOM 版（BusinessCard.svelte）と Canvas 版（render.ts）で実装が2本に分かれるので、
 * 入力だけはここに集約して両者が同じものを見るようにする。ProfileDetail をそのまま
 * 渡さないのは、ダミーデータ（fixtures.ts）でデザインを詰められるようにするため。
 */
export type BusinessCardData = {
	did: string;
	handle: string;
	displayName?: string;
	/** APPVIEW_URL を前置していない、生の avatar 値（相対パス or 絶対URL）。 */
	avatar?: string;
	/** ユーザーを表すハッシュタグ（'#' は含まない）。最大3つに丸めて渡す。 */
	tags: string[];
	/** botたんの紹介文。名刺の主役なので必ず何か入る（欠損時は comment から詰める）。 */
	tagline: string;
	/** Nagi 登録日（ISO）。 */
	joinedAt?: string;
	/** 名刺更新日（= 分析の更新日時, ISO）。 */
	updatedAt?: string;
	/** QR に載せるプロフィール URL。 */
	profileUrl: string;
};

/** 名刺に載せるタグの上限。これを超えると横1行に収まらない。 */
const MAX_TAGS = 3;

/**
 * tagline が無い相手（v1 プロンプト時代の分析のまま）では、長文コメントの頭を詰めて使う。
 * 生成される tagline の上限（120文字）に合わせる。文の途中で切れても「…」で止める。
 */
const FALLBACK_TAGLINE_LENGTH = 120;

function fallbackTagline(comment: string): string {
	// 改行は名刺では意味を持たないので潰す。
	const flat = comment.replace(/\s+/g, ' ').trim();
	if (flat.length <= FALLBACK_TAGLINE_LENGTH) return flat;
	return `${flat.slice(0, FALLBACK_TAGLINE_LENGTH)}…`;
}

/**
 * プロフィールから名刺データを組み立てる。
 * 分析がまだ無い（tagline も comment も空）なら undefined を返し、呼び出し側は名刺を出さない。
 */
export function cardFromProfile(
	profile: ProfileDetail | undefined,
	origin: string,
): BusinessCardData | undefined {
	if (!profile) return undefined;
	const tagline = profile.tagline?.trim() || fallbackTagline(profile.comment ?? '');
	if (!tagline) return undefined;
	return {
		did: profile.did,
		handle: profile.handle,
		displayName: profile.displayName,
		avatar: profile.avatar,
		tags: (profile.tags ?? []).slice(0, MAX_TAGS),
		tagline,
		joinedAt: profile.joinedAt,
		updatedAt: profile.cardUpdatedAt,
		profileUrl: `${origin}/profile/${profile.did}`,
	};
}
