import { afterEach, describe, expect, it } from 'vitest';
import { getLastReplyGate, replyGateRecordValue, setLastReplyGate } from './reply-gate';

const values = new Map<string, string>();
const stubWindow = (getItem: (key: string) => string | null = (key) => values.get(key) ?? null) =>
	Reflect.set(globalThis, 'window', {
		localStorage: {
			getItem,
			setItem: (key: string, value: string) => values.set(key, value),
		},
	});

afterEach(() => {
	values.clear();
	Reflect.deleteProperty(globalThis, 'window');
});

describe('reply gate preference', () => {
	it('defaults to everyone', () => {
		stubWindow();
		expect(getLastReplyGate()).toBe('everyone');
	});

	it('restores the last choice', () => {
		stubWindow();
		setLastReplyGate('nobody');
		expect(getLastReplyGate()).toBe('nobody');
	});

	it('ignores unknown stored values', () => {
		stubWindow();
		values.set('nagi-last-reply-gate', 'followers');
		expect(getLastReplyGate()).toBe('everyone');
	});

	it('falls back to everyone when storage throws', () => {
		stubWindow(() => {
			throw new Error('blocked');
		});
		expect(getLastReplyGate()).toBe('everyone');
	});

	it('omits the record value for everyone', () => {
		expect(replyGateRecordValue('everyone')).toBeUndefined();
		expect(replyGateRecordValue('bot')).toBe('bot');
	});
});
