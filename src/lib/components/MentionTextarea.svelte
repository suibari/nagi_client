<script lang="ts">
	import { searchActors, searchChannelsTypeahead } from '$lib/api/appview';
	import { createTypeaheadSearch } from '$lib/api/useTypeaheadSearch.svelte';
	import type { ActorView, ChannelView, EmojiView } from '$lib/api/types';
	import type { ChannelSelection, EmojiSelection, MentionSelection } from '$lib/atproto/facets';
	import { m } from '$lib/i18n/i18n.svelte';
	import { portal } from '$lib/actions/portal';
	import ActorSuggestionList from './ActorSuggestionList.svelte';
	import ChannelSuggestionList from './ChannelSuggestionList.svelte';
	import EmojiSuggestionList from './EmojiSuggestionList.svelte';
	import type { MarkdownFormat } from './MarkdownPalette.svelte';
	import { displayEmojiName, searchAvailableBluemoji } from '$lib/atproto/bluemoji';
	import {
		detectComposerSuggestionToken,
		replaceEmojiSuggestion,
		type ComposerSuggestionToken,
	} from '$lib/post/composer-suggestion';
	import { textareaCaretRect } from './textarea-caret';
	import {
		applyContentWarning as wrapContentWarning,
		remapContentWarningSelection,
	} from '$lib/atproto/contentWarning';

	let {
		value = $bindable(''),
		mentions = $bindable<MentionSelection[]>([]),
		channels = $bindable<ChannelSelection[]>([]),
		emojis = $bindable<EmojiSelection[]>([]),
		mentionSuggestionsEnabled = true,
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
		emojis?: EmojiSelection[];
		mentionSuggestionsEnabled?: boolean;
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
	const suggest = createTypeaheadSearch<ActorView>(
		(query, signal) => searchActors(query, 10, undefined, signal).then((result) => result.actors),
		{
			debounceMs: 80,
			leading: true,
			matches: (actor, query) =>
				actor.handle.toLowerCase().includes(query) ||
				(actor.displayName?.toLowerCase().includes(query) ?? false),
		},
	);
	const channelSuggest = createTypeaheadSearch<ChannelView>(
		(query, signal) => searchChannelsTypeahead(query, signal).then((result) => result.channels),
		{
			debounceMs: 80,
			leading: true,
			matches: (channel, query) => channel.name.toLowerCase().includes(query),
		},
	);
	const emojiSuggest = createTypeaheadSearch<EmojiView>(
		(query, signal) =>
			searchAvailableBluemoji({ q: query, limit: 10, signal }).then((result) => result.emojis),
		{
			debounceMs: 80,
			leading: true,
			matches: (emoji, query) =>
				displayEmojiName(emoji.name).toLowerCase().includes(query.toLowerCase()),
		},
	);
	let activeIndex = $state(0);
	let suggestionLayer = $state<HTMLDivElement>();
	let suggestionStyle = $state('');
	let suggestionPositioned = $state(false);
	let token = $state<ComposerSuggestionToken>();
	// いま候補を出している方（トークンの種類で決まる）。件数・確定はこれ経由で扱う。
	let activeSuggest = $derived(
		token?.kind === 'channel' ? channelSuggest : token?.kind === 'emoji' ? emojiSuggest : suggest,
	);

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
		emojis = shiftedSelections(emojis, prefix, oldEnd, delta);
	}

	function close() {
		token = undefined;
		suggestionPositioned = false;
		suggest.reset();
		channelSuggest.reset();
		emojiSuggest.reset();
		activeIndex = 0;
	}

	$effect(() => {
		if (!token || !suggestionLayer) return;
		const layer = suggestionLayer;
		let frame: number | undefined;
		const updatePosition = () => {
			frame = undefined;
			const rect = textarea.getBoundingClientRect();
			const caret = textareaCaretRect(textarea);
			const margin = 12;
			const gap = 4;
			const width = Math.min(360, rect.width, Math.max(0, window.innerWidth - margin * 2));
			const belowSpace = window.innerHeight - margin - caret.bottom - gap;
			const aboveSpace = caret.top - gap - margin;
			const openBelow = belowSpace >= 280 || belowSpace >= aboveSpace;
			const maxHeight = Math.max(0, Math.min(280, openBelow ? belowSpace : aboveSpace));
			const height = Math.min(layer.offsetHeight, maxHeight);
			const left = Math.min(
				Math.max(margin, caret.left),
				Math.max(margin, window.innerWidth - margin - width),
			);
			const top = openBelow ? caret.bottom + gap : Math.max(margin, caret.top - gap - height);
			suggestionStyle = `left:${left}px;top:${top}px;width:${width}px;--suggestion-max-height:${maxHeight}px;`;
			suggestionPositioned = true;
		};
		const schedule = () => {
			if (frame !== undefined) return;
			frame = requestAnimationFrame(updatePosition);
		};
		const resizeObserver = new ResizeObserver(schedule);
		resizeObserver.observe(layer);
		window.addEventListener('resize', schedule);
		window.addEventListener('scroll', schedule, true);
		updatePosition();
		return () => {
			if (frame !== undefined) cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			window.removeEventListener('resize', schedule);
			window.removeEventListener('scroll', schedule, true);
		};
	});

	function detectToken() {
		onselectionchange?.(textarea.selectionStart !== textarea.selectionEnd);
		const caret = textarea.selectionStart;
		const next = detectComposerSuggestionToken(value, caret, {
			mentions: mentionSuggestionsEnabled,
			channels: channelSuggestionsEnabled,
		});
		if (next?.kind === 'mention') {
			token = next;
			channelSuggest.reset();
			emojiSuggest.reset();
			suggest.search(next.query, () => (activeIndex = 0));
			return;
		}
		if (next?.kind === 'channel') {
			token = next;
			suggest.reset();
			emojiSuggest.reset();
			channelSuggest.search(next.query, () => (activeIndex = 0));
			return;
		}
		if (next?.kind === 'emoji') {
			token = next;
			suggest.reset();
			channelSuggest.reset();
			emojiSuggest.search(next.query, () => (activeIndex = 0));
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
		emojis = shiftForInsertions(emojis);
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

	/**
	 * キャレット位置（選択中なら選択範囲を置き換えて）に文字列を差し込む。
	 * 絵文字挿入のように「装飾ではないただの挿入」のための入口で、
	 * メンション/チャンネルの選択範囲の付け替えは insertText がまとめて面倒を見る。
	 */
	export function insertAtCaret(text: string) {
		if (disabled || !text) return;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		// 選択範囲があるときは insertText では消せないので、先に本文から取り除く。
		if (start !== end) {
			value = `${value.slice(0, start)}${value.slice(end)}`;
			const shrink = <T extends { start: number; end: number }>(items: T[]) =>
				items.flatMap((item) =>
					item.start < end && item.end > start
						? []
						: [
								{
									...item,
									start: item.start >= end ? item.start - (end - start) : item.start,
									end: item.end >= end ? item.end - (end - start) : item.end,
								},
							],
				);
			mentions = shrink(mentions);
			channels = shrink(channels);
			emojis = shrink(emojis);
		}
		insertText([{ at: start, text }], start + text.length, start + text.length);
	}

	/** Unicode は文字として、Bluemoji は :name: と追跡可能な参照範囲として挿入する。 */
	export function insertEmoji(emoji: string | EmojiView) {
		if (typeof emoji === 'string') {
			insertAtCaret(emoji.normalize('NFC'));
			return;
		}
		const start = textarea.selectionStart;
		insertAtCaret(emoji.name);
		emojis = [...emojis, { start, end: start + emoji.name.length, emoji }].sort(
			(a, b) => a.start - b.start,
		);
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
		emojis = remap(emojis);
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
		emojis = shiftedSelections(emojis, token.start, token.end, delta);
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
		emojis = shiftedSelections(emojis, token.start, token.end, delta);
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

	function chooseEmoji(emoji: EmojiView) {
		if (!token || token.kind !== 'emoji') return;
		const replacement = replaceEmojiSuggestion(value, token, emoji);
		value = replacement.text;
		mentions = shiftedSelections(mentions, token.start, token.end, replacement.delta);
		channels = shiftedSelections(channels, token.start, token.end, replacement.delta);
		emojis = [
			...shiftedSelections(emojis, token.start, token.end, replacement.delta),
			{ start: replacement.start, end: replacement.end, emoji },
		].sort((a, b) => a.start - b.start);
		const caret = replacement.end;
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
		const suggestionCount = activeSuggest.items.length;
		if (!suggestionCount || !token) {
			if (event.key === 'Escape') close();
			return;
		}
		if (event.isComposing || event.keyCode === 229) return;

		// 応答待ちの絞り込みで候補が減ると activeIndex が末尾を追い越すことがある。
		activeIndex = Math.min(activeIndex, suggestionCount - 1);
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const direction = event.key === 'ArrowDown' ? 1 : -1;
			activeIndex = (activeIndex + direction + suggestionCount) % suggestionCount;
		} else if (event.key === 'Enter' || event.key === 'Tab') {
			event.preventDefault();
			if (token.kind === 'channel') chooseChannel(channelSuggest.items[activeIndex]);
			else if (token.kind === 'emoji') chooseEmoji(emojiSuggest.items[activeIndex]);
			else choose(suggest.items[activeIndex]);
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
	{#if token}
		<div
			bind:this={suggestionLayer}
			use:portal
			class="mention-suggestions-portal"
			class:positioned={suggestionPositioned}
			style={suggestionStyle}
		>
			{#if token.kind === 'mention'}
				<ActorSuggestionList
					actors={suggest.items}
					pending={suggest.pending}
					{activeIndex}
					onchoose={choose}
				/>
			{:else if token.kind === 'channel'}
				<ChannelSuggestionList
					channels={channelSuggest.items}
					pending={channelSuggest.pending}
					{activeIndex}
					onchoose={chooseChannel}
				/>
			{:else}
				<EmojiSuggestionList
					emojis={emojiSuggest.items}
					pending={emojiSuggest.pending}
					{activeIndex}
					onchoose={chooseEmoji}
				/>
			{/if}
		</div>
	{/if}
</div>
