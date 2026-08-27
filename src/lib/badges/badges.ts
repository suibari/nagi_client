import type { ActorView } from '$lib/api/types';
import { i18n, m } from '$lib/i18n/i18n.svelte';

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

type BadgeDefinition = {
	/** false にするとデータを残したまま Nagi の全表示箇所から外せる。 */
	enabled: boolean;
	create: (actor: ActorView) => Badge | undefined;
};

/**
 * Nagi で表示するユーザーバッジの唯一のレジストリ。
 * 表示の再開は enabled、新しい種類の追加はこの配列だけを変更すればよい。
 */
const BADGE_DEFINITIONS: readonly BadgeDefinition[] = [
	{
		enabled: true,
		create: (actor) => (actor.isBot ? { id: 'bot', label: m.botBadge(), tone: 'bot' } : undefined),
	},
	{
		// 称号は Bluesky と共通。あちらのラベルは24時間で失効するが、こちらは
		// 次の日記が書かれるまで出しっぱなしにする。
		enabled: true,
		create: (actor) => {
			const title = actor.currentTitle;
			if (!title) return undefined;
			const label = i18n.locale === 'ja' ? title.ja : title.en;
			return {
				id: 'title',
				label: m.titleBadge({ title: label }),
				title: m.titleBadgeAria({ title: label }),
				tone: 'title',
			};
		},
	},
	{
		// 競争や「ネガティブなことを言いづらい」という圧力につながるため現在は非表示。
		// レベルの取得・蓄積・表示定義は残し、方針が変わったらここだけで再開できる。
		enabled: false,
		create: (actor) => {
			const level = actor.superPositiveLevel ?? 0;
			if (level <= 0) return undefined;
			return {
				id: 'super-positive',
				label: m.superPositiveBadge({ level }),
				title: m.superPositiveBadgeAria({ level }),
				tone: `tier-${superPositiveTier(level)}`,
			};
		},
	},
];

export function actorBadges(actor?: ActorView): Badge[] {
	if (!actor) return [];
	return BADGE_DEFINITIONS.flatMap((definition) => {
		if (!definition.enabled) return [];
		const badge = definition.create(actor);
		return badge ? [badge] : [];
	});
}
