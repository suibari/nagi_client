import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { linkFacets } from './facets';
import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
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
export async function createPost(
	text: string,
	reply?: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } },
) {
	const s = current();
	return new Agent(s).com.atproto.repo.createRecord({
		repo: s.did,
		collection: POST,
		validate: false,
		record: {
			$type: POST,
			text,
			facets: linkFacets(text),
			langs: [languagePreferences.postLanguage],
			createdAt: new Date().toISOString(),
			...(reply && { reply }),
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
