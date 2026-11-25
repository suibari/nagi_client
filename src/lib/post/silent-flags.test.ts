import { describe, expect, it } from 'vitest';
import { postSilentFlags } from './silent-flags';

describe('postSilentFlags', () => {
	it('makes a silent reply to Bot-tan bot-silent too', () => {
		expect(
			postSilentFlags({ reply: true, replyToBot: true, replyGate: 'everyone', silentReply: true }),
		).toEqual({ botSilent: true, silentReply: true });
	});

	it('keeps a silent reply to someone else notification-only', () => {
		expect(
			postSilentFlags({ reply: true, replyToBot: false, replyGate: 'everyone', silentReply: true }),
		).toEqual({ botSilent: false, silentReply: true });
	});

	it('lets Bot-tan answer a normal reply', () => {
		expect(
			postSilentFlags({ reply: true, replyToBot: true, replyGate: 'everyone', silentReply: false }),
		).toEqual({ botSilent: false, silentReply: false });
	});

	it('ignores silent reply for top-level posts', () => {
		expect(
			postSilentFlags({
				reply: false,
				replyToBot: false,
				replyGate: 'everyone',
				silentReply: true,
			}),
		).toEqual({ botSilent: false, silentReply: false });
	});

	it('stops everyone including Bot-tan when replies are closed', () => {
		expect(
			postSilentFlags({ reply: false, replyToBot: false, replyGate: 'nobody', silentReply: false }),
		).toEqual({ botSilent: true, silentReply: false, replyGate: 'nobody' });
	});

	it('lets only Bot-tan answer when limited to Bot-tan', () => {
		expect(
			postSilentFlags({ reply: false, replyToBot: false, replyGate: 'bot', silentReply: false }),
		).toEqual({ botSilent: false, silentReply: false, replyGate: 'bot' });
	});

	it('keeps a silent reply to Bot-tan bot-silent even when limited to Bot-tan', () => {
		expect(
			postSilentFlags({ reply: true, replyToBot: true, replyGate: 'bot', silentReply: true }),
		).toEqual({ botSilent: true, silentReply: true, replyGate: 'bot' });
	});
});
