<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		reason,
		authorDid,
	}: {
		reason?: 'moderation-policy' | 'processing-failed';
		authorDid?: string;
	} = $props();

	let title = $derived(
		reason === 'moderation-policy'
			? m.postModerationRejected()
			: reason === 'processing-failed'
				? m.postProcessingFailed()
				: m.postDeleted(),
	);

	// 「あなたのPDS」は投稿者本人にしか成り立たない。スレッド内の他人の返信や引用先でも
	// 出てしまわないよう、ここで絞る。ゲスト投稿には PDS が無いので mine 相当は使わない。
	let showPdsNote = $derived(Boolean(reason) && Boolean(authorDid) && $session?.did === authorDid);
</script>

<div class="post-unavailable" class:warning={Boolean(reason)} role="status">
	<Icon name={reason ? 'warning' : 'trash'} size={18} />
	<div>
		<strong>{title}</strong>
		{#if showPdsNote}<p>{m.postModerationPdsNote()}</p>{/if}
	</div>
</div>

<style>
	.post-unavailable {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		padding: 0.7rem 0;
		color: var(--text-muted);
	}
	.post-unavailable.warning {
		color: var(--text);
	}
	.post-unavailable :global(svg) {
		flex: 0 0 auto;
		margin-top: 0.1rem;
		color: var(--warning);
	}
	.post-unavailable strong {
		display: block;
		font-size: 0.94rem;
	}
	.post-unavailable p {
		margin: 0.22rem 0 0;
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--text-muted);
	}
</style>
