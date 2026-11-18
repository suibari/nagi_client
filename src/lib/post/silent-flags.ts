/** 送信時の botたんサイレント・サイレントリプライのフラグを決める（POST-10）。 */
export const postSilentFlags = (input: {
	reply: boolean;
	replyToBot: boolean;
	botSilent: boolean;
	silentReply: boolean;
}): { botSilent: boolean; silentReply: boolean } =>
	input.reply
		? { botSilent: input.silentReply && input.replyToBot, silentReply: input.silentReply }
		: { botSilent: input.botSilent, silentReply: false };
