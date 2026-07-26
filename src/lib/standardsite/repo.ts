import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { DOCUMENT, NAGI_PUBLIC_ORIGIN, PUBLICATION, type StandardSitePublication } from './types';

/**
 * site.standard.* は Nagi 専用のコレクションではない。同じ repo に blento.app など
 * ほかのアプリが作った publication / document が同居しうるので、
 * 「Nagi が作ったものだけ」を必ず絞り込んでから読み書きする。
 * 判別は publication.url が Nagi の公開オリジンかどうかで行う。
 *
 * records.ts からも使うため、records.ts に依存しないモジュールに切り出している
 * （publication.ts は Nagi プロフィールを読むので records.ts に依存する）。
 */
const current = () => {
	const value = get(session);
	if (!value) throw new Error('Authentication required');
	return value;
};

const rkeyOf = (uri: string) => uri.slice(uri.lastIndexOf('/') + 1);

const isNagiPublication = (value: unknown) =>
	typeof value === 'object' &&
	value !== null &&
	typeof (value as StandardSitePublication).url === 'string' &&
	(value as StandardSitePublication).url.replace(/\/+$/, '') === NAGI_PUBLIC_ORIGIN;

export type ExistingPublication = {
	uri: string;
	rkey: string;
	value: StandardSitePublication;
};

async function* listAll(collection: string) {
	const s = current();
	const agent = new Agent(s);
	let cursor: string | undefined;
	do {
		const { data } = await agent.com.atproto.repo.listRecords({
			repo: s.did,
			collection,
			limit: 100,
			cursor,
		});
		for (const record of data.records) yield record;
		cursor = data.cursor;
	} while (cursor);
}

/**
 * この DID の「Nagi の」publication を探す。key が tid なので 'self' 固定にできず、
 * ほかのアプリのレコードとも同居するため、url で照合する。Nagi は1件しか作らない。
 */
export async function findNagiPublication(): Promise<ExistingPublication | null> {
	for await (const record of listAll(PUBLICATION)) {
		if (!isNagiPublication(record.value)) continue;
		return {
			uri: record.uri,
			rkey: rkeyOf(record.uri),
			value: record.value as StandardSitePublication,
		};
	}
	return null;
}

/**
 * 全データ削除から呼ぶ、Nagi が作った standard.site レコードだけの掃除。
 * ほかのアプリの publication / document は残す。
 */
export async function deleteNagiStandardSiteRecords(): Promise<void> {
	const s = current();
	const agent = new Agent(s);
	const publication = await findNagiPublication();
	if (!publication) return;

	// document は site が Nagi の publication を指しているものだけ消す。
	const staleDocuments: string[] = [];
	for await (const record of listAll(DOCUMENT)) {
		const site = (record.value as { site?: unknown }).site;
		if (site === publication.uri) staleDocuments.push(rkeyOf(record.uri));
	}
	for (const rkey of staleDocuments) {
		await agent.com.atproto.repo.deleteRecord({ repo: s.did, collection: DOCUMENT, rkey });
	}
	await agent.com.atproto.repo.deleteRecord({
		repo: s.did,
		collection: PUBLICATION,
		rkey: publication.rkey,
	});
}
