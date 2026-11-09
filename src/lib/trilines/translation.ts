/**
 * 3行日記の訳文を行に戻す。AppView は行を改行でつないだ本文をまとめて訳すので、
 * 訳文の行数が元の行数と一致したときだけ行ごとに対応づける。
 * 一致しない（モデルが行をまとめた・分けた）ときは undefined を返し、呼び出し側は訳文を一続きで出す。
 */
export function splitTrilinesTranslation(text: string, lineCount: number): string[] | undefined {
	const lines = text.replace(/\s+$/, '').split(/\r?\n/);
	return lines.length === lineCount ? lines.map((line) => line.trim()) : undefined;
}
