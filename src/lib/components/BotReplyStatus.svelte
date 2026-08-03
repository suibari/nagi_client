<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActorView, BotReplyState } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import Avatar from './Avatar.svelte';
	import AvatarLink from './AvatarLink.svelte';

	let {
		state: botState,
		createdAt,
		botActor,
		optimistic = false,
		indent,
	}: {
		state?: BotReplyState;
		createdAt: string;
		botActor?: ActorView;
		optimistic?: boolean;
		indent?: string;
	} = $props();

	const STALE_MS = 3 * 60 * 1000;
	const LONG_WAIT_MS = 10 * 1000;
	let waiting = $derived(botState === 'pending' || botState === 'processing');
	let now = $state(Date.now());
	let age = $derived(now - new Date(createdAt).valueOf());
	let stale = $derived(waiting && age > STALE_MS);
	let longWait = $derived(waiting && age >= LONG_WAIT_MS);
	let pendingStatus = $derived(botState === 'processing' ? m.botThinking() : m.botWaiting());

	onMount(() => {
		const timer = window.setInterval(() => (now = Date.now()), 1000);
		return () => window.clearInterval(timer);
	});
</script>

{#if !optimistic && waiting && !stale}
	<div class="thread-reply" style:--reply-indent={indent}>
		<div class="bot-pending">
			{#if botActor}
				<AvatarLink actor={botActor} />
			{:else}
				<Avatar />
			{/if}
			<div class="pending-bubble" role="status" aria-live="polite">
				<div><span class="typing"><i></i><i></i><i></i></span>{pendingStatus}</div>
				{#if longWait}<small>{m.botLongWait()}</small>{/if}
			</div>
		</div>
	</div>
{:else if !optimistic && waiting}
	<p class="bot-missed">{m.botMissed()}</p>
{:else if !optimistic && botState === 'failed'}
	<p class="bot-missed" role="status">{m.botFailed()}</p>
{/if}
