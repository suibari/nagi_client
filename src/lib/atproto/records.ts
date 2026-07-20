import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { parsePostText, type MentionSelection } from './facets';
import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
import type { ImageAttachment } from '$lib/images';
const POST = 'com.suibari.nagi.post',
	REACTION = 'com.suibari.nagi.reaction',
	PROFILE = 'com.suibari.nagi.profile';
const current = () => {
	const value = get(session);
	if (!value) throw new Error('Authentication required');
	return value;
};

export type ProfileDraft = {
	displayName: string;
	description: string;
	avatar?: unknown;
	avatarUrl?: string;
	createdAt?: string;
};
export type LinkCardDraft = {
	uri: string;
	title: string;
	description?: string;
	thumbnail?: Blob;
	previewUrl?: string;
};
export type PostDraft = {
	text: string;
	facets: ReturnType<typeof parsePostText>['facets'];
	langs: string[];
	createdAt: string;
	reply?: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } };
	quote?: { uri: string; cid: string };
	attachments: ImageAttachment[];
	linkCards: LinkCardDraft[];
};

export function preparePostDraft(
	text: string,
	reply?: PostDraft['reply'],
	quote?: PostDraft['quote'],
	attachments: ImageAttachment[] = [],
	linkCards: LinkCardDraft[] = [],
	mentions: MentionSelection[] = [],
): PostDraft {
	const leadingWhitespace = text.length - text.trimStart().length;
	const source = text.trim();
	const parsed = parsePostText(
		source,
		mentions.map((mention) => ({
			...mention,
			start: mention.start - leadingWhitespace,
			end: mention.end - leadingWhitespace,
		})),
	);
	return {
		text: parsed.text,
		facets: parsed.facets,
		langs: [languagePreferences.postLanguage],
		createdAt: new Date().toISOString(),
		reply,
		quote,
		attachments: [...attachments],
		linkCards: linkCards.slice(0, 4).map((card) => ({ ...card })),
	};
}

const isRecordNotFound = (error: unknown) =>
	typeof error === 'object' &&
	error !== null &&
	(('error' in error && (error as { error?: unknown }).error === 'RecordNotFound') ||
		('message' in error &&
			typeof (error as { message?: unknown }).message === 'string' &&
			(error as { message: string }).message.includes('RecordNotFound')));

export async function getOwnNagiProfile(): Promise<ProfileDraft | null> {
	const s = current();
	try {
		const response = await new Agent(s).com.atproto.repo.getRecord({
			repo: s.did,
			collection: PROFILE,
			rkey: 'self',
		});
		const value = response.data.value as Partial<ProfileDraft>;
		return {
			displayName: typeof value.displayName === 'string' ? value.displayName : '',
			description: typeof value.description === 'string' ? value.description : '',
			avatar: value.avatar,
			createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
		};
	} catch (error) {
		if (isRecordNotFound(error)) return null;
		throw error;
	}
}

export async function getBlueskyProfileDraft(): Promise<ProfileDraft> {
	const s = current();
	const agent = new Agent(s);
	const [recordResult, viewResult] = await Promise.allSettled([
		agent.com.atproto.repo.getRecord({
			repo: s.did,
			collection: 'app.bsky.actor.profile',
			rkey: 'self',
		}),
		agent.app.bsky.actor.getProfile({ actor: s.did }),
	]);
	const record =
		recordResult.status === 'fulfilled'
			? (recordResult.value.data.value as Partial<ProfileDraft>)
			: undefined;
	const view = viewResult.status === 'fulfilled' ? viewResult.value.data : undefined;
	return {
		displayName:
			typeof record?.displayName === 'string'
				? record.displayName
				: (view?.displayName ?? view?.handle ?? ''),
		description:
			typeof record?.description === 'string' ? record.description : (view?.description ?? ''),
		avatar: record?.avatar,
		avatarUrl: view?.avatar,
	};
}

export async function uploadAvatar(blob: Blob) {
	const s = current();
	const response = await new Agent(s).com.atproto.repo.uploadBlob(blob, { encoding: blob.type });
	return response.data.blob;
}
export async function createPost(draft: PostDraft) {
	const s = current();
	const agent = new Agent(s);
	const images = await Promise.all(
		draft.attachments.map(async (attachment) => {
			const response = await agent.com.atproto.repo.uploadBlob(attachment.blob, {
				encoding: attachment.blob.type,
			});
			return {
				image: response.data.blob,
				alt: attachment.alt,
				aspectRatio: attachment.aspectRatio,
			};
		}),
	);
	const cards = await Promise.all(
		draft.linkCards.map(async (card) => {
			const thumb = card.thumbnail
				? (
						await agent.com.atproto.repo.uploadBlob(card.thumbnail, {
							encoding: card.thumbnail.type,
						})
					).data.blob
				: undefined;
			return {
				uri: card.uri,
				title: card.title,
				...(card.description ? { description: card.description } : {}),
				...(thumb ? { thumb } : {}),
			};
		}),
	);
	const embed = draft.quote
		? { $type: `${POST}#quote`, record: draft.quote, ...(images.length ? { images } : {}) }
		: images.length
			? { $type: `${POST}#images`, images }
			: undefined;
	return agent.com.atproto.repo.createRecord({
		repo: s.did,
		collection: POST,
		validate: false,
		record: {
			$type: POST,
			text: draft.text,
			facets: draft.facets,
			langs: draft.langs,
			createdAt: draft.createdAt,
			...(draft.reply && { reply: draft.reply }),
			...(cards.length && { linkCards: cards }),
			...(embed && { embed }),
		},
	});
}
export async function createReaction(subject: { uri: string; cid: string }, emoji: string) {
	const s = current();
	return new Agent(s).com.atproto.repo.createRecord({
		repo: s.did,
		collection: REACTION,
		validate: false,
		record: {
			$type: REACTION,
			subject,
			emoji: emoji.normalize('NFC'),
			createdAt: new Date().toISOString(),
		},
	});
}
export async function deleteRecord(collection: string, rkey: string) {
	const s = current();
	return new Agent(s).com.atproto.repo.deleteRecord({ repo: s.did, collection, rkey });
}
export async function deleteAllNagiRecords() {
	const s = current();
	const agent = new Agent(s);
	for (const collection of [POST, REACTION, PROFILE]) {
		let cursor: string | undefined;
		do {
			const response = await agent.com.atproto.repo.listRecords({
				repo: s.did,
				collection,
				limit: 100,
				cursor,
			});
			for (const record of response.data.records) {
				const rkey = record.uri.slice(record.uri.lastIndexOf('/') + 1);
				await agent.com.atproto.repo.deleteRecord({ repo: s.did, collection, rkey });
			}
			cursor = response.data.cursor;
		} while (cursor);
	}
}
export async function putProfile(displayName: string, description: string, draft?: ProfileDraft) {
	const s = current();
	return new Agent(s).com.atproto.repo.putRecord({
		repo: s.did,
		collection: PROFILE,
		rkey: 'self',
		validate: false,
		record: {
			$type: PROFILE,
			displayName,
			description,
			...(draft?.avatar !== undefined ? { avatar: draft.avatar } : {}),
			createdAt: draft?.createdAt ?? new Date().toISOString(),
		},
	});
}
