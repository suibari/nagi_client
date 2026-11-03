import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { VIA } from '$lib/crosspost/bluesky';
import { trilinesEntryUrl, type TrilinesLineDraft, type TrilinesRecord } from './records';

const BSKY_POST = 'app.bsky.feed.post';
const HASHTAG = 'TriLinesAt';
const SUMMARY_MAX = 200;
const encoder = new TextEncoder();
const bytes = (value: string) => encoder.encode(value).byteLength;

/**
 * Bluesky へ共有する本文。TriLinesAt の共有と同じ形（見出し・3行・日記ページへのリンク・
 * #TriLinesAt）にし、どちらから書いても同じ見た目の投稿になるようにする。
 */
export function buildTrilinesShareText(
	lines: readonly string[],
	uri: string,
	labels: { template: string; link: string },
) {
	const raw = lines.join('\n');
	const summary = raw.length > SUMMARY_MAX ? `${raw.slice(0, SUMMARY_MAX)}...` : raw;
	const head = `${labels.template}\n\n${summary}\n\n`;
	const tail = '\n\n';
	const tag = `#${HASHTAG}`;
	const text = head + labels.link + tail + tag;
	const linkStart = bytes(head);
	const tagStart = bytes(head + labels.link + tail);
	return {
		text,
		facets: [
			{
				index: { byteStart: linkStart, byteEnd: linkStart + bytes(labels.link) },
				features: [{ $type: 'app.bsky.richtext.facet#link', uri: trilinesEntryUrl(uri) }],
			},
			{
				index: { byteStart: tagStart, byteEnd: tagStart + bytes(tag) },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: HASHTAG }],
			},
		],
	};
}

/** 日記を Bluesky にも投稿する。画像は日記でアップロード済みの blob を使い回す。 */
export async function crosspostTrilinesToBluesky(
	created: { uri: string; record: TrilinesRecord },
	drafts: readonly TrilinesLineDraft[],
	labels: { template: string; link: string },
): Promise<{ uri: string; cid: string }> {
	const current = get(session);
	if (!current) throw new Error('Authentication required');
	const { text, facets } = buildTrilinesShareText(
		created.record.lines.map((line) => line.text),
		created.uri,
		labels,
	);
	// レコードの行は空行を詰めてあるので、下書きも同じ順に詰めて縦横比を引く。
	const written = drafts.filter((line) => line.text.trim());
	const images = created.record.lines.flatMap((line, index) => {
		if (!line.image) return [];
		const image = written[index]?.image;
		const aspectRatio = image?.kind === 'new' ? image.attachment.aspectRatio : undefined;
		return [{ image: line.image, alt: line.alt ?? '', ...(aspectRatio ? { aspectRatio } : {}) }];
	});
	const { data } = await new Agent(current).com.atproto.repo.createRecord({
		repo: current.did,
		collection: BSKY_POST,
		record: {
			$type: BSKY_POST,
			text,
			facets,
			langs: created.record.langs ?? [],
			createdAt: created.record.createdAt,
			via: VIA,
			...(images.length ? { embed: { $type: 'app.bsky.embed.images', images } } : {}),
		},
	});
	return { uri: data.uri, cid: data.cid };
}
