<script lang="ts">
	import { searchActors } from '$lib/api/appview';
	import type { ActorView } from '$lib/api/types';
	import type { MentionSelection } from '$lib/atproto/facets';
	import Avatar from './Avatar.svelte';

	let {
		value = $bindable(''),
		mentions = $bindable<MentionSelection[]>([]),
		id,
		placeholder,
		ariaLabel,
		disabled = false,
		onsubmit,
	}: {
		value?: string;
		mentions?: MentionSelection[];
		id?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		onsubmit?: () => void;
	} = $props();

	let textarea: HTMLTextAreaElement;
	let actors = $state<ActorView[]>([]);
	let activeIndex = $state(0);
	let token = $state<{ start: number; end: number; query: string }>();
	let timer: ReturnType<typeof setTimeout> | undefined;
	let requestId = 0;

	function updateMentionRanges(previous: string, next: string) {
		let prefix = 0;
		while (prefix < previous.length && prefix < next.length && previous[prefix] === next[prefix])
			prefix++;
		let suffix = 0;
		while (
			suffix < previous.length - prefix &&
			suffix < next.length - prefix &&
			previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
		)
			suffix++;
		const oldEnd = previous.length - suffix;
		const delta = next.length - previous.length;
		mentions = mentions.flatMap((mention) => {
			if (mention.end <= prefix) return [mention];
			if (mention.start >= oldEnd)
				return [{ ...mention, start: mention.start + delta, end: mention.end + delta }];
			return [];
		});
	}

	function close() {
		token = undefined;
		actors = [];
		activeIndex = 0;
		if (timer) clearTimeout(timer);
	}

	function detectToken() {
		const caret = textarea.selectionStart;
		const match = /(^|[\s(\[{])@([^\s@]*)$/.exec(value.slice(0, caret));
		if (!match || !match[2]) {
			close();
			return;
		}
		token = { start: caret - match[2].length - 1, end: caret, query: match[2] };
		const currentRequest = ++requestId;
		if (timer) clearTimeout(timer);
		timer = setTimeout(async () => {
			try {
				const result = await searchActors(match[2]);
				if (currentRequest !== requestId) return;
				actors = result.actors;
				activeIndex = 0;
			} catch {
				if (currentRequest === requestId) actors = [];
			}
		}, 200);
	}

	function handleInput(event: Event) {
		const next = (event.currentTarget as HTMLTextAreaElement).value;
		updateMentionRanges(value, next);
		value = next;
		detectToken();
	}

	function choose(actor: ActorView) {
		if (!token) return;
		const label = `@${actor.handle}`;
		const suffix = value.slice(token.end);
		const trailingSpace = suffix.startsWith(' ') ? '' : ' ';
		const replacementLength = label.length + trailingSpace.length;
		const delta = replacementLength - (token.end - token.start);
		value = `${value.slice(0, token.start)}${label}${trailingSpace}${suffix}`;
		mentions = [
			...mentions.flatMap((mention) => {
				if (mention.end <= token!.start) return [mention];
				if (mention.start >= token!.end)
					return [{ ...mention, start: mention.start + delta, end: mention.end + delta }];
				return [];
			}),
			{ start: token.start, end: token.start + label.length, did: actor.did, handle: actor.handle },
		].sort((a, b) => a.start - b.start);
		const caret = token.start + label.length + trailingSpace.length;
		close();
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(caret, caret);
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		// Ctrl/Cmd+Enter は投稿送信。メンション候補の Enter 確定より優先させる。
		// IME 変換確定中（isComposing）は誤爆を避けるため無視する。
		if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !event.isComposing) {
			event.preventDefault();
			onsubmit?.();
			return;
		}
		if (!actors.length || !token) {
			if (event.key === 'Escape') close();
			return;
		}
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const direction = event.key === 'ArrowDown' ? 1 : -1;
			activeIndex = (activeIndex + direction + actors.length) % actors.length;
		} else if (event.key === 'Enter' || event.key === 'Tab') {
			event.preventDefault();
			choose(actors[activeIndex]);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}
</script>

<div class="mention-textarea">
	<textarea
		bind:this={textarea}
		{id}
		{placeholder}
		{disabled}
		aria-label={ariaLabel}
		maxlength="30000"
		{value}
		oninput={handleInput}
		onclick={detectToken}
		onkeyup={(event) => {
			if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(event.key)) detectToken();
		}}
		onkeydown={handleKeydown}
		onblur={() => setTimeout(close, 150)}
	></textarea>
	{#if actors.length && token}
		<div class="mention-suggestions" role="listbox">
			{#each actors as actor, index (actor.did)}
				<button
					type="button"
					class:active={index === activeIndex}
					role="option"
					aria-selected={index === activeIndex}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => choose(actor)}
				>
					<Avatar {actor} size="small" />
					<span
						><strong>{actor.displayName ?? actor.handle}</strong><small>@{actor.handle}</small
						></span
					>
				</button>
			{/each}
		</div>
	{/if}
</div>
