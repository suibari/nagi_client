import type { PostView } from '$lib/api/types';
import { APPVIEW_URL, getThread } from '$lib/api/appview';
import { getRecord } from '$lib/atproto/pds';
import { extractTitle } from '$lib/atproto/markdown';
import {
	restorePostEditState,
	type EmojiSelection,
	type MentionSelection,
} from '$lib/atproto/facets';
import type { LinkCardDraft } from '$lib/atproto/records';
import type { ImageAttachment, PostEditImage } from '$lib/images';
import { tagsFromFacets } from '$lib/standardsite/document';
import { DOCUMENT } from '$lib/standardsite/types';
import { articleMedia } from './articleMedia';
import { blobKey } from './inlineImages';

/** 執筆ページで編集する既存の記事。Composer の初期値になる。 */
export type BlogEditTarget = {
	uri: string;
	cid: string;
	rkey: string;
	post: PostView;
	title: string;
	/** 先頭の「# タイトル」を除いた本文。 */
	text: string;
	mentions: MentionSelection[];
	emojis: EmojiSelection[];
	images: ImageAttachment[];
	linkCards: LinkCardDraft[];
	/** 記事メタ欄のタグ。本文のハッシュタグから付いたものは除く（保存時に足し直す）。 */
	tags: string[];
};

const appViewOrigins = () => [new URL(APPVIEW_URL, 'http://localhost').origin];
const resolveAsset = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);

export function blogEditTargetFromPost(post: PostView, documentTags: string[]): BlogEditTarget {
	const prefix = post.text.match(/^# [^\n]+\n*/)?.[0] ?? '';
	const offset = new TextEncoder().encode(prefix).length;
	const facets = post.facets
		?.filter((facet) => facet.index.byteStart >= offset)
		.map((facet) => ({
			...facet,
			index: { byteStart: facet.index.byteStart - offset, byteEnd: facet.index.byteEnd - offset },
		}));
	const restored = restorePostEditState(post.text.slice(prefix.length), facets);
	const origins = appViewOrigins();
	const cover = articleMedia(post.text, post.images, post.linkCards, origins).cover;
	const images = (post.images ?? []).flatMap((image, sourceIndex): ImageAttachment[] => {
		const key = blobKey(image.url, origins);
		if (!key) return [];
		return [
			{
				id: `${post.cid}-${sourceIndex}`,
				existing: {
					sourceIndex,
					cid: key.slice(key.lastIndexOf('/') + 1),
					...(image.aspectRatio ? { aspectRatio: image.aspectRatio } : {}),
				},
				...(sourceIndex === 0 && cover === image ? { header: true } : {}),
				blob: new Blob(),
				previewUrl: resolveAsset(image.url),
				alt: image.alt,
				...(image.contentWarning ? { contentWarning: true } : {}),
				aspectRatio: image.aspectRatio ?? { width: 1, height: 1 },
			},
		];
	});
	const bodyTags = new Set(tagsFromFacets(post.facets));
	return {
		uri: post.uri,
		cid: post.cid,
		rkey: post.uri.slice(post.uri.lastIndexOf('/') + 1),
		post,
		title: extractTitle(post.text) ?? '',
		text: restored.text,
		mentions: restored.mentions,
		emojis: restored.emojis,
		images,
		linkCards: (post.linkCards ?? []).map((card, sourceIndex) => ({
			id: `${post.cid}-link-${sourceIndex}`,
			sourceIndex,
			uri: card.uri,
			title: card.title,
			description: card.description,
			previewUrl: card.thumb,
		})),
		tags: [...new Set(documentTags)].filter((tag) => !bodyTags.has(tag)),
	};
}

/** 保存用に、執筆ページの添付を updatePost の画像編集へ戻す。 */
export function toPostEditImage(image: ImageAttachment): PostEditImage {
	if (!image.existing) return { ...image, kind: 'new' };
	return {
		kind: 'existing',
		id: image.id,
		sourceIndex: image.existing.sourceIndex,
		previewUrl: image.previewUrl,
		alt: image.alt,
		...(image.contentWarning ? { contentWarning: true } : {}),
		...(image.existing.aspectRatio ? { aspectRatio: image.existing.aspectRatio } : {}),
	};
}

/**
 * 本人の記事（site.standard.document）を編集用に読み込む。
 * 見つからない、削除済み、本人のものでない場合は undefined。
 */
export async function loadBlogEditTarget(
	did: string,
	rkey: string,
): Promise<BlogEditTarget | undefined> {
	const uri = `at://${did}/${DOCUMENT}/${rkey}`;
	const [thread, record] = await Promise.all([
		getThread(uri)
			.then((result) => result.thread)
			.catch(() => undefined),
		getRecord(did, DOCUMENT, rkey),
	]);
	const post = thread?.post;
	if (!post || !record || post.deleted || post.author.did !== did || post.uri !== uri)
		return undefined;
	const tags = Array.isArray(record.value.tags)
		? record.value.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
		: [];
	return blogEditTargetFromPost(post, tags);
}
