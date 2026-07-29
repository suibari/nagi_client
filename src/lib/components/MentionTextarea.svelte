<script lang="ts">
	import { searchActors, searchChannelsTypeahead } from '$lib/api/appview';
	import { createActorSearch } from '$lib/api/useActorSearch.svelte';
	import type { ActorView, ChannelView } from '$lib/api/types';
	import type { ChannelSelection, MentionSelection } from '$lib/atproto/facets';
	import { m } from '$lib/i18n/i18n.svelte';
	import ActorSuggestionList from './ActorSuggestionList.svelte';
	import ChannelSuggestionList from './ChannelSuggestionList.svelte';
	import type { MarkdownFormat } from './MarkdownPalette.svelte';
	import {
		applyContentWarning as wrapContentWarning,
		remapContentWarningSelection,
	} from '$lib/atproto/contentWarning';

	let {
		value = $bindable(''),
		mentions = $bindable<MentionSelection[]>([]),
		channels = $bindable<ChannelSelection[]>([]),
		channelSuggestionsEnabled = false,
		id,
		placeholder,
		ariaLabel,
		disabled = false,
		onsubmit,
		onpaste,
		onselectionchange,
	}: {
		value?: string;
		mentions?: MentionSelection[];
		channels?: ChannelSelection[];
		channelSuggestionsEnabled?: boolean;
		id?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		onsubmit?: () => void;
		onpaste?: (event: ClipboardEvent) => void;
		onselectionchange?: (selected: boolean) => void;
	} = $props();

	let textarea: HTMLTextAreaElement;
	// Composer は最初の1文字を即時検索し、連続入力だけ短くまとめる。
	const suggest = createActorSearch(searchActors, { debounceMs: 80, leading: true });
	let suggestedChannels = $state<ChannelView[]>([]);
	let channelTimer: ReturnType<typeof setTimeout> | undefined;
	let channelRequestId = 0;
	let channelSearchStarted = false;
	let activeIndex = $state(0);
	let token = $state<
		| { kind: 'mention'; start: number; end: number; query: string }
		| { kind: 'channel'; start: number; end: number; query: string; marker: '#' | '＃' }
	>();

	function shiftedSelections<T extends { start: number; end: number }>(
		selections: T[],
		prefix: number,
		oldEnd: number,
		delta: number,
	): T[] {
		return selections.flatMap((selection) => {
			if (selection.end <= prefix) return [selection];
			if (selection.start >= oldEnd)
				return [{ ...selection, start: selection.start + delta, end: selection.end + delta }];
			return [];
		});
	}

	function updateSelectionRanges(previous: string, next: string) {
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
		mentions = shiftedSelections(mentions, prefix, oldEnd, delta);
		channels = shiftedSelections(channels, prefix, oldEnd, delta);
	}

	function resetChannelSearch() {
		suggestedChannels = [];
		channelRequestId++;
		if (channelTimer) clearTimeout(channelTimer);
		channelTimer = undefined;
		channelSearchStarted = false;
	}

	function close() {
		token = undefined;
		suggest.reset();
		resetChannelSearch();
		activeIndex = 0;
	}

	function searchChannels(query: string) {
		const current = ++channelRequestId;
		if (channelTimer) clearTimeout(channelTimer);
		const delay = channelSearchStarted ? 80 : 0;
		channelSearchStarted = true;
		channelTimer = setTimeout(async () => {
			channelTimer = undefined;
			try {
				const result = await searchChannelsTypeahead(query);
				if (current !== channelRequestId) return;
				suggestedChannels = result.channels;
				activeIndex = 0;
			} catch {
				if (current === channelRequestId) suggestedChannels = [];
			}
		}, delay);
	}

	function detectToken() {
		onselectionchange?.(textarea.selectionStart !== textarea.selectionEnd);
		const caret = textarea.selectionStart;
		const match = /(^|[\s(\[{])@([^\s@]*)$/.exec(value.slice(0, caret));
		if (match?.[2]) {
			token = {
				kind: 'mention',
				start: caret - match[2].length - 1,
				end: caret,
				query: match[2],
			};
			resetChannelSearch();
			suggest.search(match[2], () => (activeIndex = 0));
			return;
		}
		const channelMatch = channelSuggestionsEnabled
			? /(^|[\s(\[{])([#＃])([^\s#＃]*)$/.exec(value.slice(0, caret))
			: undefined;
		if (channelMatch?.[3]) {
			token = {
				kind: 'channel',
				start: caret - channelMatch[3].length - 1,
				end: caret,
				query: channelMatch[3],
				marker: channelMatch[2] as '#' | '＃',
			};
			suggest.reset();
			searchChannels(channelMatch[3]);
			return;
		}
		close();
	}

	function handleInput(event: Event) {
		const next = (event.currentTarget as HTMLTextAreaElement).value;
		updateSelectionRanges(value, next);
		value = next;
		detectToken();
	}

	type Insertion = { at: number; text: string };

	function insertText(insertions: Insertion[], selectionStart: number, selectionEnd: number) {
		const ordered = [...insertions].sort((a, b) => b.at - a.at);
		let next = value;
		for (const insertion of ordered) {
			next = `${next.slice(0, insertion.at)}${insertion.text}${next.slice(insertion.at)}`;
		}
		const shiftForInsertions = <T extends { start: number; end: number }>(selections: T[]): T[] =>
			selections.flatMap((selection) => {
				if (
					insertions.some(
						(insertion) => insertion.at > selection.start && insertion.at < selection.end,
					)
				)
					return [];
				const startShift = insertions.reduce(
					(total, insertion) =>
						total + (insertion.at <= selection.start ? insertion.text.length : 0),
					0,
				);
				const endShift = insertions.reduce(
					(total, insertion) => total + (insertion.at < selection.end ? insertion.text.length : 0),
					0,
				);
				return [
					{
						...selection,
						start: selection.start + startShift,
						end: selection.end + endShift,
					},
				];
			});
		mentions = shiftForInsertions(mentions);
		channels = shiftForInsertions(channels);
		value = next;
		close();
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(selectionStart, selectionEnd);
		});
	}

	function applyInlineFormat(prefix: string, suffix: string, placeholder: string) {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		if (start === end) {
			insertText(
				[{ at: start, text: `${prefix}${placeholder}${suffix}` }],
				start + prefix.length,
				start + prefix.length + placeholder.length,
			);
			return;
		}
		insertText(
			[
				{ at: start, text: prefix },
				{ at: end, text: suffix },
			],
			start + prefix.length,
			end + prefix.length,
		);
	}

	function applyLineFormat(format: MarkdownFormat) {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const firstLineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
		const coveredEnd = end > start && value[end - 1] === '\n' ? end - 1 : end;
		const lineStarts = [firstLineStart];
		for (
			let newline = value.indexOf('\n', firstLineStart);
			newline !== -1 && newline < coveredEnd;
		) {
			lineStarts.push(newline + 1);
			newline = value.indexOf('\n', newline + 1);
		}
		const insertions = lineStarts.map((at, index) => ({
			at,
			text:
				format === 'heading'
					? '# '
					: format === 'bulletList'
						? '- '
						: format === 'numberedList'
							? `${index + 1}. `
							: '> ',
		}));
		const shiftBeforeStart = insertions.reduce(
			(total, insertion) => total + (insertion.at <= start ? insertion.text.length : 0),
			0,
		);
		const shiftBeforeEnd = insertions.reduce(
			(total, insertion) => total + (insertion.at <= end ? insertion.text.length : 0),
			0,
		);
		insertText(insertions, start + shiftBeforeStart, end + shiftBeforeEnd);
	}

	export function applyMarkdown(format: MarkdownFormat) {
		if (disabled) return;
		if (format === 'bold') applyInlineFormat('**', '**', m.markdownBoldPlaceholder());
		else if (format === 'italic') applyInlineFormat('*', '*', m.markdownItalicPlaceholder());
		else if (format === 'strike') applyInlineFormat('~~', '~~', m.markdownStrikePlaceholder());
		else applyLineFormat(format);
	}

	export function applyContentWarning() {
		if (disabled) return;
		const previous = value;
		const result = wrapContentWarning(previous, textarea.selectionStart, textarea.selectionEnd);
		if (result.text === previous) return;
		const remap = <T extends { start: number; end: number }>(items: T[]) =>
			items.map((item) => ({
				...item,
				...remapContentWarningSelection(previous, result, item.start, item.end),
			}));
		mentions = remap(mentions);
		channels = remap(channels);
		value = result.text;
		close();
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
			onselectionchange?.(result.selectionStart !== result.selectionEnd);
		});
	}

	function choose(actor: ActorView) {
		if (!token || token.kind !== 'mention') return;
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
		channels = shiftedSelections(channels, token.start, token.end, delta);
		const caret = token.start + label.length + trailingSpace.length;
		close();
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(caret, caret);
		});
	}

	function chooseChannel(channel: ChannelView) {
		if (!token || token.kind !== 'channel') return;
		const label = `${token.marker}${channel.name}`;
		const suffix = value.slice(token.end);
		const trailingSpace = suffix.startsWith(' ') ? '' : ' ';
		const replacementLength = label.length + trailingSpace.length;
		const delta = replacementLength - (token.end - token.start);
		value = `${value.slice(0, token.start)}${label}${trailingSpace}${suffix}`;
		mentions = shiftedSelections(mentions, token.start, token.end, delta);
		channels = [
			...shiftedSelections(channels, token.start, token.end, delta),
			{
				start: token.start,
				end: token.start + label.length,
				uri: channel.uri,
				cid: channel.cid,
				name: channel.name,
				banner: channel.banner,
				description: channel.description,
			},
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
		if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.isComposing) {
			const key = event.key.toLowerCase();
			const format =
				key === 'b' && !event.shiftKey
					? 'bold'
					: key === 'i' && !event.shiftKey
						? 'italic'
						: key === 's' && event.shiftKey
							? 'strike'
							: undefined;
			if (format) {
				event.preventDefault();
				applyMarkdown(format);
				return;
			}
		}
		const suggestionCount =
			token?.kind === 'channel' ? suggestedChannels.length : suggest.actors.length;
		if (!suggestionCount || !token) {
			if (event.key === 'Escape') close();
			return;
		}
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const direction = event.key === 'ArrowDown' ? 1 : -1;
			activeIndex = (activeIndex + direction + suggestionCount) % suggestionCount;
		} else if (event.key === 'Enter' || event.key === 'Tab') {
			event.preventDefault();
			if (token.kind === 'channel') chooseChannel(suggestedChannels[activeIndex]);
			else choose(suggest.actors[activeIndex]);
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
		onselect={() => onselectionchange?.(textarea.selectionStart !== textarea.selectionEnd)}
		onkeyup={(event) => {
			if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(event.key)) detectToken();
		}}
		onkeydown={handleKeydown}
		{onpaste}
		onblur={() => setTimeout(close, 150)}
	></textarea>
	{#if token?.kind === 'mention'}
		<ActorSuggestionList actors={suggest.actors} {activeIndex} onchoose={choose} />
	{:else if token?.kind === 'channel'}
		<ChannelSuggestionList channels={suggestedChannels} {activeIndex} onchoose={chooseChannel} />
	{/if}
</div>
