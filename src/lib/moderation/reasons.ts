/**
 * 自動モデレーションで伏せた理由を、ぼかしの見出しに出す。
 *
 * 一律に「自動モデレーション」とだけ出すと、なぜ伏せられたかが分からず好奇心で
 * 開かれてしまう。AppView が返す moderationLabels から理由を引いて添える。
 * 判定には誤りがありうるので、文言はどれも「〜の可能性」にしてある。
 */
import { m } from '$lib/i18n/i18n.svelte';

type ReasonKey =
	| 'moderationReasonSexual'
	| 'moderationReasonNudity'
	| 'moderationReasonGraphic'
	| 'moderationReasonHate'
	| 'moderationReasonHarassment'
	| 'moderationReasonSensitive';

/**
 * ラベル → 理由。
 *
 * !hide（画像の未成年に関わる性的表現の判定）は sexual と同じ文言にする。誤判定だった
 * ときに、その疑いを投稿へ公に貼らないため。未成年の閲覧者にはサーバがそもそも返さない。
 * !warn は自傷・画像の暴力・違法行為などの受け皿なので、まとめた文言で出す。
 */
const REASONS: Record<string, ReasonKey> = {
	sexual: 'moderationReasonSexual',
	'!hide': 'moderationReasonSexual',
	nudity: 'moderationReasonNudity',
	'graphic-media': 'moderationReasonGraphic',
	hate: 'moderationReasonHate',
	harassment: 'moderationReasonHarassment',
	'!warn': 'moderationReasonSensitive',
};

/** ラベルから理由のキーを引く。知らないラベルは汎用の文言に寄せ、同じ理由は1つにまとめる。 */
export function moderationReasonKeys(labels: readonly string[] | undefined): ReasonKey[] {
	const keys: ReasonKey[] = [];
	for (const label of labels ?? []) {
		const key = REASONS[label] ?? 'moderationReasonSensitive';
		if (!keys.includes(key)) keys.push(key);
	}
	return keys;
}

/** ぼかしの見出しの下に出す理由。例 ["性的な表現の可能性"]。ラベルが無ければ空。 */
export function automaticModerationReasons(labels: readonly string[] | undefined): string[] {
	return moderationReasonKeys(labels).map((key) => m[key]());
}
