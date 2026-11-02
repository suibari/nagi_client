import { describe, expect, it } from 'vitest';
import { swipeDirection } from './gestures';

describe('swipeDirection', () => {
	it('commits a slow drag past roughly a third of the width', () => {
		expect(swipeDirection(-140, -0.1, 390)).toBe(1);
		expect(swipeDirection(140, 0.1, 390)).toBe(-1);
	});
	it('snaps back a short, slow drag', () => {
		expect(swipeDirection(-100, -0.1, 390)).toBe(0);
	});
	it('commits a quick flick even when short', () => {
		expect(swipeDirection(-50, -0.8, 390)).toBe(1);
	});
	it('does not commit a flick that reverses against the drag', () => {
		expect(swipeDirection(-50, 0.8, 390)).toBe(0);
	});
	it('ignores tiny flicks', () => {
		expect(swipeDirection(-20, -1.5, 390)).toBe(0);
	});
});
