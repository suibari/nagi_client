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
	import { onMount } from 'svelte';
	import { Annotation, Compartment, EditorState, type Transaction } from '@codemirror/state';
	import { EditorView, keymap, placeholder as placeholderExtension } from '@codemirror/view';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import { composerDecorations, refreshDecorations } from './composer-decorations';
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
		ontextinput,
		oncompositionchange,
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
		ontextinput?: (event: InputEvent) => void;
		oncompositionchange?: (composing: boolean) => void;
		onselectionchange?: (selected: boolean) => void;
	} = $props();

	let host: HTMLDivElement;
	let view: EditorView | undefined;
	/** 選択範囲をこのコンポーネントが自分で付け替える変更。差分からの付け替えを二重にしない。 */
	const managed = Annotation.define<boolean>();
	const editable = new Compartment();
	const attributes = new Compartment();
	const placeholderText = new Compartment();
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

	const selectionStart = () => view?.state.selection.main.from ?? value.length;
	const selectionEnd = () => view?.state.selection.main.to ?? value.length;
	const focusEditor = () => requestAnimationFrame(() => view?.focus());

	/**
	 * 本文を next に置き換え、選択範囲を [anchor, head] にする。変わった区間だけを差し替えるので、
	 * 取り消し（Undo）の単位とキャレット位置が自然に保たれる。
	 */
	function setText(next: string, anchor?: number, head = anchor) {
		if (!view) return;
		const previous = view.state.doc.toString();
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
		view.dispatch({
			changes:
				previous === next
					? undefined
					: {
							from: prefix,
							to: previous.length - suffix,
							insert: next.slice(prefix, next.length - suffix),
						},
			selection:
				anchor === undefined
					? undefined
					: { anchor: Math.min(anchor, next.length), head: Math.min(head!, next.length) },
			annotations: managed.of(true),
		});
	}

	/** 利用者の入力を、呼び出し側が見ている InputEvent の形へ直す（下書きアシストの判定用）。 */
	function inputEventFor(transactions: readonly Transaction[], composing: boolean) {
		const typed = transactions.filter((transaction) => transaction.docChanged);
		if (!typed.length || typed.every((transaction) => transaction.annotation(managed))) return;
		const deleting = typed.some((transaction) => transaction.isUserEvent('delete'));
		const composed = typed.some((transaction) => transaction.isUserEvent('input.type.compose'));
		return new InputEvent('input', {
			inputType: deleting
				? 'deleteContentBackward'
				: composed
					? 'insertCompositionText'
					: 'insertText',
			isComposing: composing,
		});
	}

	onMount(() => {
		view = new EditorView({
			parent: host,
			state: EditorState.create({
				doc: value,
				extensions: [
					history(),
					// CodeMirror は更新のたびに外枠の class を組み直すので、属性として渡す
					EditorView.editorAttributes.of({ class: 'composer-input' }),
					EditorView.lineWrapping,
					composerDecorations(() => ({ mentions, channels, emojis })),
					placeholderText.of(placeholder ? placeholderExtension(placeholder) : []),
					editable.of([EditorView.editable.of(!disabled), EditorState.readOnly.of(disabled)]),
					attributes.of(EditorView.contentAttributes.of(contentAttributes())),
					keymap.of([
						{ key: 'ArrowDown', run: () => moveSuggestion(1) },
						{ key: 'ArrowUp', run: () => moveSuggestion(-1) },
						{ key: 'Enter', run: (target) => chooseActive() || continueList(target) },
						{ key: 'Tab', run: chooseActive },
						{ key: 'Escape', run: closeSuggestions },
						// Ctrl/Cmd+Enter は投稿送信。候補の Enter 確定より後に判定する。
						{
							key: 'Mod-Enter',
							run: () => {
								onsubmit?.();
								return true;
							},
						},
						{ key: 'Mod-b', run: () => runFormat('bold') },
						{ key: 'Mod-i', run: () => runFormat('italic') },
						{ key: 'Mod-Shift-s', run: () => runFormat('strike') },
						...historyKeymap,
						...defaultKeymap,
					]),
					EditorView.domEventHandlers({
						paste: (event) => {
							onpaste?.(event);
							// 引用や画像として引き取られた貼り付けは本文へ入れない
							return event.defaultPrevented;
						},
						compositionstart: () => oncompositionchange?.(true),
						compositionend: () => oncompositionchange?.(false),
						blur: () => {
							setTimeout(close, 150);
						},
					}),
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							const previous = update.startState.doc.toString();
							const next = update.state.doc.toString();
							if (!update.transactions.some((transaction) => transaction.annotation(managed)))
								updateSelectionRanges(previous, next);
							value = next;
							const event = inputEventFor(update.transactions, update.view.composing);
							if (event) ontextinput?.(event);
						}
						if (update.docChanged || update.selectionSet) {
							// 候補の確定や装飾ボタンによる変更では、候補を開き直さない
							if (update.transactions.some((transaction) => transaction.annotation(managed)))
								onselectionchange?.(!update.state.selection.main.empty);
							else detectToken();
						}
					}),
				],
			}),
		});
		return () => {
			view?.destroy();
			view = undefined;
		};
	});

	function contentAttributes() {
		return {
			...(id ? { id } : {}),
			...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
			// 投稿の本文と同じく、日本語の文節で折り返す（word-break: auto-phrase）
			lang: document.documentElement.lang || 'ja',
		};
	}

	// 外から本文が差し替わったとき（投稿後のクリア、下書きの読み込みなど）に取り込む。
	$effect(() => {
		const next = value;
		if (view && next !== view.state.doc.toString()) setText(next, next.length);
	});

	// メンション等の選択範囲が変わったら、リンク色の装飾を付け直す。
	$effect(() => {
		void [mentions, channels, emojis];
		view?.dispatch({ effects: refreshDecorations.of(null) });
	});

	$effect(() => {
		const locked = disabled;
		view?.dispatch({
			effects: editable.reconfigure([
				EditorView.editable.of(!locked),
				EditorState.readOnly.of(locked),
			]),
		});
	});

	$effect(() => {
		const text = placeholder;
		view?.dispatch({
			effects: placeholderText.reconfigure(text ? placeholderExtension(text) : []),
		});
	});

	$effect(() => {
		void [id, ariaLabel];
		view?.dispatch({
			effects: attributes.reconfigure(EditorView.contentAttributes.of(contentAttributes())),
		});
	});

	/** キャレットの画面座標。レイアウト前などで測れないときは入力欄の左上を使う。 */
	function caretRect() {
		const coords = view?.coordsAtPos(view.state.selection.main.head);
		if (coords) return { left: coords.left, top: coords.top, bottom: coords.bottom };
		const rect = (view?.dom ?? host).getBoundingClientRect();
		return { left: rect.left, top: rect.top, bottom: rect.top + 27 };
	}

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
			const rect = (view?.dom ?? host).getBoundingClientRect();
			const caret = caretRect();
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
		onselectionchange?.(selectionStart() !== selectionEnd());
		const caret = view?.state.selection.main.head ?? value.length;
		const next = detectComposerSuggestionToken(view?.state.doc.toString() ?? value, caret, {
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
		ontextinput?.(event as InputEvent);
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
		setText(next, selectionStart, selectionEnd);
		close();
		focusEditor();
	}

	function applyInlineFormat(prefix: string, suffix: string, placeholder: string) {
		const start = selectionStart();
		const end = selectionEnd();
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
		const start = selectionStart();
		const end = selectionEnd();
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
		const start = selectionStart();
		const end = selectionEnd();
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
		const start = selectionStart();
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
		const result = wrapContentWarning(previous, selectionStart(), selectionEnd());
		if (result.text === previous) return;
		const remap = <T extends { start: number; end: number }>(items: T[]) =>
			items.map((item) => ({
				...item,
				...remapContentWarningSelection(previous, result, item.start, item.end),
			}));
		mentions = remap(mentions);
		channels = remap(channels);
		emojis = remap(emojis);
		setText(result.text, result.selectionStart, result.selectionEnd);
		close();
		focusEditor();
		onselectionchange?.(result.selectionStart !== result.selectionEnd);
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
		setText(value, caret);
		close();
		focusEditor();
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
		setText(value, caret);
		close();
		focusEditor();
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
		setText(value, caret);
		close();
		focusEditor();
	}

	function runFormat(format: MarkdownFormat) {
		applyMarkdown(format);
		return true;
	}

	// 候補が出ている間だけ、矢印・Enter・Tab・Esc を候補の操作に使う。
	// 変換中（IME）のキー入力は CodeMirror がここへ渡さない。
	function suggestionsOpen() {
		if (!token || !activeSuggest.items.length) return false;
		// 応答待ちの絞り込みで候補が減ると activeIndex が末尾を追い越すことがある。
		activeIndex = Math.min(activeIndex, activeSuggest.items.length - 1);
		return true;
	}

	function moveSuggestion(direction: 1 | -1) {
		if (!suggestionsOpen()) return false;
		const count = activeSuggest.items.length;
		activeIndex = (activeIndex + direction + count) % count;
		return true;
	}

	function chooseActive() {
		if (!suggestionsOpen() || !token) return false;
		if (token.kind === 'channel') chooseChannel(channelSuggest.items[activeIndex]);
		else if (token.kind === 'emoji') chooseEmoji(emojiSuggest.items[activeIndex]);
		else choose(suggest.items[activeIndex]);
		return true;
	}

	const LIST_ITEM = /^(?:([-*])|(\d{1,9})([.)]))[ \t]+/;

	/** 箇条書きの行末で Enter を押すと次の項目を始め、空の項目で押すと箇条書きを終える。 */
	function continueList(target: EditorView) {
		const { state } = target;
		const range = state.selection.main;
		const line = state.doc.lineAt(range.head);
		if (!range.empty || range.head !== line.to) return false;
		const item = LIST_ITEM.exec(line.text);
		if (!item) return false;
		if (item[0].length === line.text.length) {
			target.dispatch({ changes: { from: line.from, to: line.to }, userEvent: 'delete' });
			return true;
		}
		const marker = item[1] ? `${item[1]} ` : `${Number(item[2]) + 1}${item[3]} `;
		target.dispatch(state.replaceSelection(`\n${marker}`), { userEvent: 'input' });
		return true;
	}

	function closeSuggestions() {
		if (!token) return false;
		close();
		return true;
	}
</script>

<div class="mention-textarea">
	<div bind:this={host} class="composer-input-host"></div>
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
