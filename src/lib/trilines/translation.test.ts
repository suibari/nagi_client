import { describe, expect, it } from 'vitest';
import { splitTrilinesTranslation } from './translation';

describe('splitTrilinesTranslation', () => {
	it('maps each translated line back to its diary line', () => {
		expect(splitTrilinesTranslation('Rainy day.\nRead a book.\nSlept early.\n', 3)).toEqual([
			'Rainy day.',
			'Read a book.',
			'Slept early.',
		]);
		expect(splitTrilinesTranslation('A\r\nB', 2)).toEqual(['A', 'B']);
	});

	it('gives up on line mapping when the line count changed', () => {
		expect(splitTrilinesTranslation('Rainy day, read a book.\nSlept early.', 3)).toBeUndefined();
		expect(splitTrilinesTranslation('A\nB\nC\nD', 3)).toBeUndefined();
	});
});
