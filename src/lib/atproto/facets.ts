export function linkFacets(text: string) {
	const facets: any[] = [];
	const encoder = new TextEncoder();
	for (const match of text.matchAll(/https?:\/\/[^\s]+/g)) {
		const start = match.index!;
		facets.push({
			index: {
				byteStart: encoder.encode(text.slice(0, start)).length,
				byteEnd: encoder.encode(text.slice(0, start + match[0].length)).length,
			},
			features: [{ $type: 'app.bsky.richtext.facet#link', uri: match[0] }],
		});
	}
	return facets;
}
