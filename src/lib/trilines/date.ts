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

/** その日の範囲 [from, to)。「botたんに相談」で材料にする投稿の期間に使う。 */
export function diaryDayRange(value: string | Date = new Date()): { from: Date; to: Date } {
	const from = getDiaryDate(value);
	const to = new Date(from);
	to.setDate(to.getDate() + 1);
	return { from, to };
}
