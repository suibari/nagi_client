<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Avatar from './Avatar.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		kind,
		author,
		name,
		disabled = false,
		onremove,
		children,
	}: {
		kind: 'reply' | 'quote';
		author?: { handle: string; displayName?: string; avatar?: string };
		name?: string;
		disabled?: boolean;
		onremove?: () => void;
		children: Snippet;
	} = $props();

	const removeLabel = $derived(kind === 'reply' ? m.replyRemove() : m.quoteRemove());
</script>

<div class="composer-target-box">
	<div class="composer-target-card" class:reply={kind === 'reply'} class:quote={kind === 'quote'}>
		<div class="composer-target-header">
			<div class="composer-target-badge">
				<Icon name={kind} size={14} />
				<span>{kind === 'reply' ? m.replyTargetLabel() : m.quoteTargetLabel()}</span>
				{#if author}<span class="composer-target-sub">@{author.handle}</span>{/if}
			</div>
			{#if onremove}
				<button
					type="button"
					class="composer-target-remove icon-action"
					{disabled}
					aria-label={removeLabel}
					title={removeLabel}
					onclick={onremove}
				>
					<Icon name="close" size={16} />
				</button>
			{/if}
		</div>
		<div class="composer-target-body">
			{#if author}<Avatar actor={author} size="small" />{/if}
			<div class="composer-target-content">
				<div class="composer-target-meta">
					<span class="name">{author?.displayName || author?.handle || name}</span>
				</div>
				{@render children()}
			</div>
		</div>
	</div>
</div>
