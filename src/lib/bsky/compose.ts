import { get } from 'svelte/store';
import { uploadPostAssets, type PostDraft } from '$lib/atproto/records';
import { crosspostToBluesky, type CreatedBskyPost } from '$lib/crosspost/bluesky';
import { session } from '$lib/oauth/session.svelte';
import type { BskyComposeTarget } from '$lib/post/composer-host.svelte';
import { myProfile } from '$lib/profile/me.svelte';
import { tagsFromFacets } from '$lib/standardsite/document';
import { tagFavorites } from '$lib/tag-favorites/tag-favorites.svelte';
import { invalidateBskyThread } from './agent';
import { toPostCard } from './mapView';
import { sentBskyReplies, type SentBskyReply } from './sent-replies.svelte';

function sentReply(
	{ ref, record }: CreatedBskyPost,
	author: { did: string; handle: string; displayName?: string; avatar?: string },
	draft: PostDraft,
): SentBskyReply {
	const objectUrls: string[] = [];
	const preview = (blob: Blob) => {
		const url = URL.createObjectURL(blob);
		objectUrls.push(url);
		return url;
	};
	const post = toPostCard({ ...ref, record, author, indexedAt: record.createdAt });
	// The composer releases its previews when it closes. Keep these URLs until AppView takes over.
	if (record.embed?.$type === 'app.bsky.embed.images') {
		post.images = draft.attachments.slice(0, 4).map(({ blob, alt, aspectRatio }) => ({
			url: preview(blob),
			alt,
			aspectRatio,
		}));
	} else if (record.embed?.$type === 'app.bsky.embed.external' && draft.linkCards[0]) {
		const { uri, title, description, thumbnail } = draft.linkCards[0];
		post.external = { uri, title, description, thumb: thumbnail && preview(thumbnail) };
	}
	return { post, objectUrls };
}

export async function postToBluesky(draft: PostDraft, target: BskyComposeTarget) {
	const owner = get(session);
	if (!owner) throw new Error('Authentication required');
	const assets = await uploadPostAssets(draft);
	if (get(session) !== owner) throw new Error('Session changed');

	const created: CreatedBskyPost[] = [];
	try {
		const result = await crosspostToBluesky(
			draft,
			assets,
			target.kind === 'reply'
				? { reply: { root: target.root, parent: target.parent } }
				: { quote: target.parent },
			undefined,
			(post) => created.push(post),
		);
		if (!result) throw new Error('Nothing to post');
		tagFavorites.recordUsed(
			created.flatMap(({ record }) => tagsFromFacets(record.facets)),
			owner.did,
		);
		return result;
	} finally {
		if (get(session) === owner && target.kind === 'reply' && created.length) {
			const profile = myProfile.current;
			const author = profile?.did === owner.did ? profile : { did: owner.did, handle: owner.did };
			invalidateBskyThread(target.root.uri);
			sentBskyReplies.add(
				target.root.uri,
				created.map((post) => sentReply(post, author, draft)),
			);
		}
	}
}
