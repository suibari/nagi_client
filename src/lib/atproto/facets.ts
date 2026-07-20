export type Facet = {
	index: { byteStart: number; byteEnd: number };
	features: Array<
		| { $type: 'app.bsky.richtext.facet#link'; uri: string }
		| { $type: 'app.bsky.richtext.facet#mention'; did: string }
	>;
};

export type MentionSelection = { start: number; end: number; did: string; handle: string };
export type ParsedPostText = { text: string; facets: Facet[]; urls: string[] };

const encoder = new TextEncoder();
const byteLength = (value: string) => encoder.encode(value).length;
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
