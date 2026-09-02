import { describe, it, expect } from 'vitest';
import { extractPostLabels, shouldBlurMedia, AVAILABLE_SELF_LABELS } from './labels';

describe('labels utility', () => {
	it('extracts self labels from what the AppView returns', () => {
		const labels = extractPostLabels({ selfLabels: ['sexual', 'ai-generated'] });
		expect(labels).toEqual([
			{ val: 'sexual', isSelfLabel: true },
			{ val: 'ai-generated', isSelfLabel: true },
		]);
	});

	it('extracts automatic moderation labels', () => {
		const labels = extractPostLabels({ moderationLabels: ['graphic-media'] });
		expect(labels).toEqual([{ val: 'graphic-media', isSelfLabel: false }]);
	});

	it('keeps both kinds of label and tells them apart', () => {
		const labels = extractPostLabels({
			selfLabels: ['ai-generated'],
			moderationLabels: ['sexual'],
		});
		expect(labels).toHaveLength(2);
		expect(labels.filter((l) => l.isSelfLabel)).toHaveLength(1);
		expect(labels.filter((l) => !l.isSelfLabel)).toHaveLength(1);
	});

	it('returns nothing when the post carries no labels', () => {
		expect(extractPostLabels({})).toEqual([]);
	});

	it('determines media blur correctly for sensitive labels', () => {
		expect(shouldBlurMedia([{ val: 'sexual' }]).shouldBlur).toBe(true);
		expect(shouldBlurMedia([{ val: 'graphic-media' }]).shouldBlur).toBe(true);
		expect(shouldBlurMedia([{ val: '!hide' }]).shouldBlur).toBe(true);
		expect(shouldBlurMedia([{ val: 'ai-generated' }]).shouldBlur).toBe(false);
		expect(shouldBlurMedia([]).shouldBlur).toBe(false);
	});

	it('provides localized badge text for defined self labels', () => {
		const blurRes = shouldBlurMedia([{ val: 'sexual' }]);
		expect(blurRes.shouldBlur).toBe(true);
		expect(blurRes.labelName).toContain('性的コンテンツ');
	});

	it('offers exactly the self labels the lexicon accepts', () => {
		expect(AVAILABLE_SELF_LABELS.map((l) => l.value)).toEqual([
			'sexual',
			'graphic-media',
			'ai-generated',
		]);
	});
});
