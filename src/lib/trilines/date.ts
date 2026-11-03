/**
 * 3行日記の「日」。TriLinesAt と同じく、端末のローカル時刻の正午から翌日の正午までを1日とする
 * （夜更かしして日付をまたいでも、その日の日記として数える）。
 * 夏時間で正午の位置がずれないよう、時間の足し算ではなく暦で計算する。
 * 真実源は TriLinesAt の src/lib/diaryDate.ts。
 */
export function getDiaryDate(value: string | Date = new Date()): Date {
	const date = new Date(value);
	if (date.getHours() < 12) date.setDate(date.getDate() - 1);
	date.setHours(12, 0, 0, 0);
	return date;
}

export function formatDateKey(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getDiaryDateKey(value: string | Date = new Date()): string {
	return formatDateKey(getDiaryDate(value));
}

/**
 * 「botたんに相談」で材料にする投稿の期間 [from, to)。日記の日付の0時から今まで。
 *
 * 日記の日付は正午区切りだが、材料まで正午で切ると、夜に書いたときにその日の午前中の
 * 出来事が入らない。日付は正午区切りのまま決め、材料はその日付の朝から拾う。
 * 日付をまたいだ深夜（正午前）に書いたときは、前日の0時から今までになる（最大で約36時間）。
 */
export function consultRange(now: Date = new Date()): { from: Date; to: Date } {
	const from = getDiaryDate(now);
	from.setHours(0, 0, 0, 0);
	return { from, to: new Date(now) };
}
