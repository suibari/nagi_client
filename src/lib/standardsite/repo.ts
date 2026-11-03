import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import type { Facet } from '$lib/api/types';
import { toCommonMark } from './commonmark';
import {
	DOCUMENT,
	LEGACY_PUBLICATION_URL,
	MARKDOWN,
	MARKDOWN_TEXT,
	NAGI_PUBLIC_ORIGIN,
	nagiPublicationUrl,
	PUBLICATION,
	type StandardSitePublication,
} from './types';

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

const publicationUrl = (value: unknown) =>
	typeof value === 'object' &&
	value !== null &&
	typeof (value as StandardSitePublication).url === 'string'
		? (value as StandardSitePublication).url.replace(/\/+$/, '')
		: undefined;

/** Nagi の publication か。移行前の共通 url と、この DID 用の url のどちらも認める。 */
const isNagiPublication = (value: unknown, did: string) => {
	const url = publicationUrl(value);
	return url === LEGACY_PUBLICATION_URL || url === nagiPublicationUrl(did);
};

/** 移行前の共通 url のままか。 */
export const hasLegacyPublicationUrl = (value: unknown) =>
	publicationUrl(value) === LEGACY_PUBLICATION_URL;

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
	const s = current();
	for await (const record of listAll(PUBLICATION)) {
		if (!isNagiPublication(record.value, s.did)) continue;
		return {
			uri: record.uri,
			rkey: rkeyOf(record.uri),
			value: record.value as StandardSitePublication,
		};
	}
	return null;
}

type DocumentValue = Record<string, unknown> & {
	site?: unknown;
	path?: unknown;
	nagi?: { text?: unknown; facets?: unknown } & Record<string, unknown>;
	content?: { $type?: unknown; text?: { $type?: unknown; markdown?: unknown } };
};

/**
 * 移行前の document を今の形へ直した値を返す。直す所が無ければ undefined。
 * - path を publication.url からの相対（/<rkey>）へ
 * - Nagi の原文を nagi.text へ移し、content には書き出した GFM を置く
 */
export function migratedDocument(value: DocumentValue, did: string, rkey: string) {
	const next: DocumentValue = { ...value };
	let changed = false;
	if (value.path === `/blog/${did}/${rkey}`) {
		next.path = `/${rkey}`;
		changed = true;
	}
	const markdown = value.content?.text?.markdown;
	if (
		typeof value.nagi?.text !== 'string' &&
		value.content?.$type === MARKDOWN &&
		typeof markdown === 'string'
	) {
		const facets = Array.isArray(value.nagi?.facets) ? (value.nagi.facets as Facet[]) : [];
		next.nagi = { ...(value.nagi ?? {}), text: markdown };
		next.content = {
			...value.content,
			flavor: 'gfm',
			text: {
				...value.content.text,
				$type: MARKDOWN_TEXT,
				markdown: toCommonMark(markdown, facets, NAGI_PUBLIC_ORIGIN),
			},
		} as DocumentValue['content'];
		changed = true;
	}
	return changed ? next : undefined;
}

/**
 * Nagi の publication に属する document を今の形へそろえる。
 * publication.url をユーザーごとへ変えたときに呼ぶ（path の基準が変わるため）。
 * 途中で失敗しても、次の呼び出しで残りを直せる（直し済みは migratedDocument が飛ばす）。
 */
export async function migrateNagiDocuments(publicationUri: string): Promise<void> {
	const s = current();
	const agent = new Agent(s);
	for await (const record of listAll(DOCUMENT)) {
		const value = record.value as DocumentValue;
		if (value.site !== publicationUri) continue;
		const rkey = rkeyOf(record.uri);
		const next = migratedDocument(value, s.did, rkey);
		if (!next) continue;
		await agent.com.atproto.repo.putRecord({
			repo: s.did,
			collection: DOCUMENT,
			rkey,
			validate: false,
			record: next,
			swapRecord: record.cid,
		});
	}
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
