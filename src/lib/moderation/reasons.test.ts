import { describe, expect, it } from 'vitest';
import { automaticModerationReasons, moderationReasonKeys } from './reasons';

describe('automatic moderation reasons', () => {
	it('turns labels into readable reasons', () => {
		expect(automaticModerationReasons(['sexual'])).toEqual(['性的な表現の可能性']);
		expect(automaticModerationReasons(['graphic-media'])).toEqual([
			'暴力的・ショッキングな画像の可能性',
		]);
	});

	it('shows !hide with the same wording as sexual', () => {
		expect(automaticModerationReasons(['!hide'])).toEqual(['性的な表現の可能性']);
	});

	it('lists several reasons and merges duplicates', () => {
		expect(automaticModerationReasons(['sexual', '!hide', 'harassment'])).toEqual([
			'性的な表現の可能性',
			'攻撃的な表現の可能性',
		]);
	});

	it('falls back to a generic reason for unknown labels', () => {
		expect(moderationReasonKeys(['something-new'])).toEqual(['moderationReasonSensitive']);
		expect(automaticModerationReasons(['!warn'])).toEqual(['センシティブな内容の可能性']);
	});

	it('returns nothing when there is no label', () => {
		expect(automaticModerationReasons([])).toEqual([]);
		expect(automaticModerationReasons(undefined)).toEqual([]);
	});
});
