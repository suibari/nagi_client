import type { ActorView } from '$lib/api/types';
import { i18n, m } from '$lib/i18n/i18n.svelte';

/**
 * 「誰にどのバッジが付くか」を決める唯一の場所。
 * バッジを増やすときは actorBadges() に1エントリ追加するだけで、
 * 表示側（ActorBadges.svelte）は触らなくてよい。
 */
export type Badge = {
	id: string;
	label: string;
	/** ホバー時の補足。読み上げ用の言い換えにも使う。 */
	title?: string;
	/** CSS 修飾子 `.badge--{tone}` に対応するトークン名。 */
	tone: string;
};

/** 超ポジティブLvの色が変わる境界。下限値の昇順。 */
export const SUPER_POSITIVE_TIERS = [1, 10, 25, 50, 100] as const;

/** レベルから 1〜5 のティアを返す。100以上はすべて最上位（Bluesky側のラベルもここで頭打ち）。 */
export function superPositiveTier(level: number): number {
	let tier = 1;
	SUPER_POSITIVE_TIERS.forEach((threshold, index) => {
		if (level >= threshold) tier = index + 1;
	});
	return tier;
}

export function actorBadges(actor?: ActorView): Badge[] {
	if (!actor) return [];
	const badges: Badge[] = [];

	if (actor.isBot) {
		badges.push({ id: 'bot', label: m.botBadge(), tone: 'bot' });
	}

	// 称号は Bluesky と共通。あちらのラベルは24時間で失効するが、こちらは
	// 次の日記が書かれるまで出しっぱなしにする。
	const title = actor.currentTitle;
	if (title) {
		const label = i18n.locale === 'ja' ? title.ja : title.en;
		badges.push({
			id: 'title',
			label: m.titleBadge({ title: label }),
			title: m.titleBadgeAria({ title: label }),
			tone: 'title',
		});
	}

	const level = actor.superPositiveLevel ?? 0;
	if (level > 0) {
		badges.push({
			id: 'super-positive',
			label: m.superPositiveBadge({ level }),
			title: m.superPositiveBadgeAria({ level }),
			tone: `tier-${superPositiveTier(level)}`,
		});
	}

	return badges;
}
