import { describe, expect, it } from 'vitest';
import { selectProfileTags } from './tags';

describe('selectProfileTags', () => {
	it('keeps the first three analysis tags before three randomly selected interests', () => {
		expect(
			selectProfileTags(
				['analysis-1', 'analysis-2', 'analysis-3', 'analysis-4'],
				['a', 'b', 'c', 'd'],
				() => 0,
			),
		).toEqual(['analysis-1', 'analysis-2', 'analysis-3', 'b', 'c', 'd']);
	});

	it('removes blanks, hash prefixes, duplicates, and interests already used as analysis tags', () => {
		expect(
			selectProfileTags(
				[' #Nagi ', 'nagi', '', '分析'],
				['NAGI', '＃音楽', '音楽', '散歩'],
				() => 0.99,
			),
		).toEqual(['Nagi', '分析', '音楽', '散歩']);
	});
});
