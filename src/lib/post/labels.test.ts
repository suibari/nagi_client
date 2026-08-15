import { describe, it, expect } from 'vitest';
import { extractPostLabels, shouldBlurMedia, AVAILABLE_SELF_LABELS } from './labels';

describe('labels utility', () => {
	it('extracts self-labels correctly', () => {
		const post = {
			record: {
				labels: {
					$type: 'com.atproto.label.defs#selfLabels',
					values: [{ val: 'sexual' }, { val: 'ai-generated' }],
				},
			},
		};

		const labels = extractPostLabels(post);
		expect(labels).toHaveLength(2);
		expect(labels[0]).toEqual({ val: 'sexual', isSelfLabel: true });
		expect(labels[1]).toEqual({ val: 'ai-generated', isSelfLabel: true });
	});

	it('extracts server/labeler labels correctly and ignores negated labels', () => {
		const post = {
			labels: [
				{ val: 'graphic-media', src: 'did:plc:gvlryvidmd4yju24sdqi5rao' },
				{ val: 'spam', neg: true, src: 'did:plc:gvlryvidmd4yju24sdqi5rao' },
			],
		};

		const labels = extractPostLabels(post);
		expect(labels).toHaveLength(1);
		expect(labels[0]).toEqual({
			val: 'graphic-media',
			src: 'did:plc:gvlryvidmd4yju24sdqi5rao',
			isSelfLabel: false,
		});
	});

	it('determines media blur correctly for sensitive labels', () => {
		expect(shouldBlurMedia([{ val: 'sexual' }]).shouldBlur).toBe(true);
		expect(shouldBlurMedia([{ val: 'graphic-media' }]).shouldBlur).toBe(true);
		expect(shouldBlurMedia([{ val: 'ai-generated' }]).shouldBlur).toBe(false);
		expect(shouldBlurMedia([]).shouldBlur).toBe(false);
	});

	it('provides localized badge text for defined self labels', () => {
		const blurRes = shouldBlurMedia([{ val: 'sexual' }]);
		expect(blurRes.shouldBlur).toBe(true);
		expect(blurRes.labelName).toContain('性的コンテンツ');
	});
});
