import type { DiaryDayPreferences } from '$lib/api/types';

/**
 * 自動検出では使わないタイムゾーン。Firefox の耐フィンガープリンティングなどは、本当の場所を
 * 隠すために UTC を返す。AppView も同じ条件で捨てるが、無駄に送らないようこちらでも弾く。
 */
const HIDDEN_ZONE = /^(UTC|GMT|UCT|Zulu|Universal|Etc\/.*)$/i;

/** この端末のタイムゾーン。取れなければ undefined。 */
export function deviceTimezone(): string | undefined {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
	} catch {
		return undefined;
	}
}

/**
 * Nagi を開いたときに AppView へ送るタイムゾーン。送らないなら undefined。
 * - 旧 AppView（diaryDay を返さない）には送らない。
 * - 本人が手動で選んでいる間は送らない（設定画面でそう説明している）。
 * - すでに同じ値が届いていれば送らない。
 */
export function timezoneToReport(
	diaryDay: DiaryDayPreferences | undefined,
	detected: string | undefined,
): string | undefined {
	if (!diaryDay || diaryDay.manualTimezone) return undefined;
	if (!detected || HIDDEN_ZONE.test(detected)) return undefined;
	if (diaryDay.detectedTimezone === detected) return undefined;
	return detected;
}
