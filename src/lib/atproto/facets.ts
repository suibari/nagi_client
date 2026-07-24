export type Facet = {
	index: { byteStart: number; byteEnd: number };
	features: Array<
		| { $type: 'app.bsky.richtext.facet#link'; uri: string }
		| { $type: 'app.bsky.richtext.facet#mention'; did: string }
		| { $type: 'app.bsky.richtext.facet#tag'; tag: string }
	>;
};

export type MentionSelection = { start: number; end: number; did: string; handle: string };
export type ParsedPostText = { text: string; facets: Facet[]; urls: string[] };
type StoredFacet = {
	index: { byteStart: number; byteEnd: number };
	features: readonly unknown[];
};
type PostEditState = { text: string; mentions: MentionSelection[] };

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const byteLength = (value: string) => encoder.encode(value).length;
// Bluesky detectFacets のタグ本体クラス: 先頭のゼロ幅系を除外し、数字のみのタグを弾く。
const TAG_BODY = /^[^\s\u00AD\u2060\u200A\u200B\u200C\u200D\u20E2]*[^\d\s]\S*/u;
export const httpUrl = (value: string) => {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
	} catch {
		return undefined;
	}
};
const trimRawUrl = (value: string) => {
	let result = value;
	while (/[.,!?;:、。！？\]}]$/.test(result)) result = result.slice(0, -1);
	while (
		result.endsWith(')') &&
		(result.match(/\(/g)?.length ?? 0) < (result.match(/\)/g)?.length ?? 0)
	)
		result = result.slice(0, -1);
	return result;
};

/**
 * 保存済み本文と facet を Composer が再解釈できる編集入力へ戻す。
 * facet の位置は UTF-8 バイト単位なので、文字列へ戻しながら mention の文字位置を組み直す。
 * 名前付きリンクは保存時に Markdown 記法が本文から除かれるため、[label](url) へ復元する。
 */
export function restorePostEditState(
	text: string,
	facets: readonly StoredFacet[] = [],
): PostEditState {
	const bytes = encoder.encode(text);
	const mentions: MentionSelection[] = [];
	let source = '';
	let byteOffset = 0;

	for (const facet of [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart)) {
		const start = facet.index.byteStart;
		const end = facet.index.byteEnd;
		if (
			!Number.isInteger(start) ||
			!Number.isInteger(end) ||
			start < byteOffset ||
			end <= start ||
			end > bytes.length
		)
			continue;
		const feature = facet.features.find((item) => {
			if (typeof item !== 'object' || item === null) return false;
			const type = (item as { $type?: unknown }).$type;
			return (
				type === 'app.bsky.richtext.facet#link' ||
				type === 'app.bsky.richtext.facet#mention' ||
				type === 'app.bsky.richtext.facet#tag'
			);
		}) as { $type: string; uri?: unknown; did?: unknown } | undefined;
		if (!feature) continue;

		let before: string;
		let label: string;
		try {
			before = decoder.decode(bytes.slice(byteOffset, start));
			label = decoder.decode(bytes.slice(start, end));
		} catch {
			// 壊れたバイト境界の facet は復元対象にせず、本文をそのまま残す。
			continue;
		}
		source += before;
		const selectionStart = source.length;

		if (feature.$type === 'app.bsky.richtext.facet#link' && typeof feature.uri === 'string') {
			const uri = httpUrl(feature.uri);
			source += uri && httpUrl(label) !== uri ? `[${label}](${uri})` : label;
		} else {
			source += label;
			if (
				feature.$type === 'app.bsky.richtext.facet#mention' &&
				typeof feature.did === 'string' &&
				label.startsWith('@') &&
				label.length > 1
			) {
				mentions.push({
					start: selectionStart,
					end: selectionStart + label.length,
					did: feature.did,
					handle: label.slice(1),
				});
			}
		}
		byteOffset = end;
	}

	try {
		source += decoder.decode(bytes.slice(byteOffset));
	} catch {
		return { text, mentions: [] };
	}
	return { text: source, mentions };
}

export function parsePostText(
	source: string,
	mentionSelections: MentionSelection[] = [],
): ParsedPostText {
	let text = '';
	const facets: Facet[] = [];
	const urls: string[] = [];
	const add = (label: string, uri: string) => {
		const byteStart = byteLength(text);
		text += label;
		facets.push({
			index: { byteStart, byteEnd: byteStart + byteLength(label) },
			features: [{ $type: 'app.bsky.richtext.facet#link', uri }],
		});
		if (!urls.includes(uri)) urls.push(uri);
	};
	const mentions = [...mentionSelections]
		.filter(
			(mention) =>
				mention.start >= 0 &&
				mention.end > mention.start &&
				source.slice(mention.start, mention.end) === `@${mention.handle}`,
		)
		.sort((a, b) => a.start - b.start);
	let mentionIndex = 0;

	for (let index = 0; index < source.length;) {
		while (mentions[mentionIndex]?.start < index) mentionIndex++;
		const mention = mentions[mentionIndex];
		if (mention?.start === index) {
			const label = source.slice(mention.start, mention.end);
			const byteStart = byteLength(text);
			text += label;
			facets.push({
				index: { byteStart, byteEnd: byteStart + byteLength(label) },
				features: [{ $type: 'app.bsky.richtext.facet#mention', did: mention.did }],
			});
			index = mention.end;
			mentionIndex++;
			continue;
		}
		if (
			(source[index] === '#' || source[index] === '＃') &&
			(index === 0 || /\s/.test(source[index - 1]))
		) {
			// Bluesky の detectFacets に倣う: # の後ろが数字のみ/ゼロ幅は不可、末尾の
			// 句読点は tag から除く。tag 値は原文ケースを保持し、小文字化は保存/URL 側で行う。
			const body = TAG_BODY.exec(source.slice(index + 1))?.[0];
			if (body) {
				const tag = body.replace(/\p{P}+$/gu, '');
				if (tag && byteLength(tag) <= 640) {
					const marker = source[index];
					const byteStart = byteLength(text);
					text += marker + body;
					facets.push({
						index: { byteStart, byteEnd: byteStart + byteLength(marker + tag) },
						features: [{ $type: 'app.bsky.richtext.facet#tag', tag }],
					});
					index += 1 + body.length;
					continue;
				}
			}
		}
		if (source[index] === '[') {
			const labelEnd = source.indexOf('](', index + 1);
			if (labelEnd > index + 1) {
				let depth = 1;
				let end = labelEnd + 2;
				for (; end < source.length; end++) {
					if (source[end] === '(') depth++;
					if (source[end] === ')' && --depth === 0) break;
				}
				if (depth === 0) {
					const uri = httpUrl(source.slice(labelEnd + 2, end));
					if (uri) {
						add(source.slice(index + 1, labelEnd), uri);
						index = end + 1;
						continue;
					}
				}
			}
		}
		const raw = /https?:\/\/[^\s<>]+/.exec(source.slice(index));
		if (raw?.index === 0) {
			const label = trimRawUrl(raw[0]);
			const uri = httpUrl(label);
			if (uri) {
				add(label, uri);
				index += label.length;
				continue;
			}
		}
		text += source[index++];
	}
	return { text, facets, urls };
}

export const linkFacets = (text: string) => parsePostText(text).facets;
