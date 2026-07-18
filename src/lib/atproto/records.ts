import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { linkFacets } from './facets';
const POST = 'com.suibari.nagi.post',
	REACTION = 'com.suibari.nagi.reaction',
	PROFILE = 'com.suibari.nagi.profile';
const current = () => {
	const value = get(session);
	if (!value) throw new Error('Authentication required');
	return value;
};
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
export async function putProfile(displayName: string, description: string) {
	const s = current();
	return new Agent(s).com.atproto.repo.putRecord({
		repo: s.did,
		collection: PROFILE,
		rkey: 'self',
		validate: false,
		record: { $type: PROFILE, displayName, description, createdAt: new Date().toISOString() },
	});
}
