<script lang="ts">
	import { formatUnread, type NavBadge } from './nav';
	// ストアは props として受ける（ローカル変数に取り出すと初期値しか捕まえられない）。
	let { unread, style, aria }: NavBadge = $props();
</script>

{#if $unread > 0}
	{#if style === 'dot'}
		<span class="nav-unread-dot"><span class="visually-hidden">{aria($unread)}</span></span>
	{:else}
		<span class="nav-badge" aria-label={aria($unread)}>{formatUnread($unread)}</span>
	{/if}
{/if}
