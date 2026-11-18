import { describe, expect, it } from 'vitest';
import { postSilentFlags } from './silent-flags';

describe('postSilentFlags', () => {
	it('makes a silent reply to Bot-tan bot-silent too', () => {
		expect(
			postSilentFlags({ reply: true, replyToBot: true, botSilent: false, silentReply: true }),
		).toEqual({ botSilent: true, silentReply: true });
	});

	it('keeps a silent reply to someone else notification-only', () => {
		expect(
			postSilentFlags({ reply: true, replyToBot: false, botSilent: false, silentReply: true }),
		).toEqual({ botSilent: false, silentReply: true });
	});

	it('lets Bot-tan answer a normal reply', () => {
		expect(
			postSilentFlags({ reply: true, replyToBot: true, botSilent: true, silentReply: false }),
		).toEqual({ botSilent: false, silentReply: false });
	});

	it('uses the bot-silent toggle only for top-level posts', () => {
		expect(
			postSilentFlags({ reply: false, replyToBot: false, botSilent: true, silentReply: true }),
		).toEqual({ botSilent: true, silentReply: false });
	});
});
