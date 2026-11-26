<script lang="ts">
	import { REPLY_AUDIENCES, type BskyGateSettings, type ReplyAudience } from '$lib/bsky/gates';
	import { m } from '$lib/i18n/i18n.svelte';

	/**
	 * Bluesky での返信できる人と、引用の可否（BSKY-12）。
	 * 返信の制限はスレッドの先頭にだけ効くので、返信として投稿するときは出さない。
	 */
	let {
		settings = $bindable(),
		replyApplicable = true,
		disabled = false,
		/** 公式アプリで組んだ、Nagi で選べない返信の条件が付いている。触らなければそのまま残る。 */
		customReply = false,
		onreplychange,
	}: {
		settings: BskyGateSettings;
		replyApplicable?: boolean;
		disabled?: boolean;
		customReply?: boolean;
		/** 返信できる人を利用者が選び直した。 */
		onreplychange?: () => void;
	} = $props();

	const uid = $props.id();
	const audienceLabel = (value: ReplyAudience) =>
		value === 'everyone'
			? m.replyEveryone()
			: value === 'following'
				? m.bskyReplyFollowing()
				: value === 'followers'
					? m.bskyReplyFollowers()
					: value === 'mentioned'
						? m.bskyReplyMentioned()
						: m.replyNobody();
</script>

<div class="bsky-gates">
	{#if replyApplicable}
		<label class="bsky-gate-row" for={`${uid}-reply`}>
			<span>{m.replyAudience()}</span>
			<select
				id={`${uid}-reply`}
				value={customReply ? '' : settings.reply}
				{disabled}
				onchange={(event) => {
					settings = { ...settings, reply: event.currentTarget.value as ReplyAudience };
					onreplychange?.();
				}}
			>
				{#if customReply}<option value="" disabled>{m.bskyReplyCustom()}</option>{/if}
				{#each REPLY_AUDIENCES as value (value)}
					<option {value}>{audienceLabel(value)}</option>
				{/each}
			</select>
		</label>
	{/if}
	<label class="bsky-gate-row bsky-gate-check">
		<input
			type="checkbox"
			checked={settings.allowQuote}
			{disabled}
			onchange={(event) => (settings = { ...settings, allowQuote: event.currentTarget.checked })}
		/>
		<span>{m.bskyAllowQuote()}</span>
	</label>
</div>

<style>
	.bsky-gates {
		display: grid;
		gap: 8px;
		font-size: 13px;
	}
	.bsky-gate-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		color: var(--text-sub);
	}
	.bsky-gate-row select {
		min-height: 32px;
		padding: 4px 8px;
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		background: var(--surface-1);
		color: var(--text);
		font: inherit;
	}
	.bsky-gate-check {
		justify-content: flex-start;
	}
</style>
