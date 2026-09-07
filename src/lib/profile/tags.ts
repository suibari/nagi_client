const ANALYSIS_TAG_LIMIT = 3;
const INTEREST_TAG_LIMIT = 3;

function normalizeTag(value: string): string {
	return value
		.trim()
		.replace(/^[#＃]+/, '')
		.trim();
}

function uniqueTags(values: readonly string[], excluded = new Set<string>()): string[] {
	const result: string[] = [];
	const seen = new Set(excluded);
	for (const value of values) {
		const tag = normalizeTag(value);
		if (!tag) continue;
		const key = tag.toLocaleLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(tag);
	}
	return result;
}

/**
 * プロフィール表示用の6タグを作る。
 * 前半は分析タグを元の順序のまま最大3件、後半は興味テーマから最大3件を毎回選び直す。
 */
export function selectProfileTags(
	analysisTags: readonly string[] = [],
	interestKeywords: readonly string[] = [],
	random: () => number = Math.random,
): string[] {
	const analysis = uniqueTags(analysisTags).slice(0, ANALYSIS_TAG_LIMIT);
	const analysisKeys = new Set(analysis.map((tag) => tag.toLocaleLowerCase()));
	const interests = uniqueTags(interestKeywords, analysisKeys);

	for (let index = interests.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(random() * (index + 1));
		[interests[index], interests[swapIndex]] = [interests[swapIndex], interests[index]];
	}

	return [...analysis, ...interests.slice(0, INTEREST_TAG_LIMIT)];
}
