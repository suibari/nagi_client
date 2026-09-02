import { describe, expect, it } from 'vitest';
import { positionFloatingMenu } from './floating-menu';

const viewport = { left: 0, top: 0, width: 390, height: 700 };

describe('positionFloatingMenu', () => {
	it('keeps a menu inside the right edge of the browser viewport', () => {
		const result = positionFloatingMenu(
			{ left: 360, right: 388, top: 300, bottom: 328 },
			viewport,
			260,
		);

		expect(result.left).toBe(58);
		expect(result.left + result.width).toBe(378);
	});

	it('opens above when there is not enough room below', () => {
		const result = positionFloatingMenu(
			{ left: 20, right: 48, top: 630, bottom: 658 },
			viewport,
			260,
		);

		expect(result.placement).toBe('above');
		expect(result.top).toBe(362);
	});

	it('limits menu height to the larger available side', () => {
		const result = positionFloatingMenu(
			{ left: 20, right: 48, top: 90, bottom: 118 },
			viewport,
			800,
		);

		expect(result.placement).toBe('below');
		expect(result.maxHeight).toBe(562);
	});

	it('honors an offset visual viewport', () => {
		const result = positionFloatingMenu(
			{ left: 120, right: 148, top: 240, bottom: 268 },
			{ left: 100, top: 200, width: 320, height: 400 },
			180,
		);

		expect(result.left).toBe(112);
		expect(result.top).toBe(276);
	});
});
