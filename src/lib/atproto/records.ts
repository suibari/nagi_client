import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { parsePostText, type MentionSelection } from './facets';
import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
import type { ImageAttachment } from '$lib/images';
import type { EmojiView } from '$lib/api/types';
import { BLUEMOJI_ITEM, bluemojiRefOf } from './bluemoji';
const POST = 'com.suibari.nagi.post',
	REACTION = 'com.suibari.nagi.reaction',
	PROFILE = 'com.suibari.nagi.profile',
	CHANNEL = 'com.suibari.nagi.channel';
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
	/** こっそりモード。true のトップレベル投稿はグローバル/全肯定TLに出さない。 */
	kossori?: boolean;
	/** 所属チャンネルへの参照。返信は親の channel を引き継ぐ。 */
	channel?: { uri: string; cid: string };
	/** true なら CH 限定＝グローバルTL非表示。 */
	channelOnly?: boolean;
};

export function preparePostDraft(
	text: string,
	reply?: PostDraft['reply'],
	quote?: PostDraft['quote'],
	attachments: ImageAttachment[] = [],
	linkCards: LinkCardDraft[] = [],
	mentions: MentionSelection[] = [],
	kossori = false,
	channel?: { uri: string; cid: string },
	channelOnly = false,
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
		...(kossori ? { kossori: true } : {}),
		...(channel ? { channel } : {}),
		...(channel && channelOnly ? { channelOnly: true } : {}),
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
/**
 * 投稿に添付する blob をアップロードした結果。Bluesky クロスポストでも
 * 同じ blobRef を使い回すため、レコード作成とは分けて公開している。
 */
export type PostAssets = {
	images: { image: unknown; alt: string; aspectRatio: { width: number; height: number } }[];
	cards: { uri: string; title: string; description?: string; thumb?: unknown }[];
};

export async function uploadPostAssets(draft: PostDraft): Promise<PostAssets> {
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
	return { images, cards };
}

export async function createPost(draft: PostDraft, assets?: PostAssets) {
	const s = current();
	const agent = new Agent(s);
	const { images, cards } = assets ?? (await uploadPostAssets(draft));
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
			...(draft.kossori && { kossori: true }),
			...(draft.channel && { channel: draft.channel }),
			...(draft.channel && draft.channelOnly && { channelOnly: true }),
			...(draft.reply && { reply: draft.reply }),
			// ニュース引用はNagiでは専用カードを描画する。linkCardsはBluesky変換用だけに使う。
			...(cards.length &&
				draft.quote?.uri.split('/')[3] !== 'com.suibari.nagi.news' && { linkCards: cards }),
			...(embed && { embed }),
		},
	});
}
/**
 * 既存のトップレベル投稿のこっそり状態だけを切り替える。text/embed/facets 等は
 * getRecord で取得した値をそのまま putRecord で書き戻して保持する。
 */
export async function setPostKossori(rkey: string, kossori: boolean) {
	const s = current();
	const agent = new Agent(s);
	const { data } = await agent.com.atproto.repo.getRecord({
		repo: s.did,
		collection: POST,
		rkey,
	});
	const record: Record<string, unknown> = {
		...(data.value as Record<string, unknown>),
		$type: POST,
	};
	if (kossori) record.kossori = true;
	else delete record.kossori;
	return agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: POST,
		rkey,
		validate: false,
		record,
	});
}
/**
 * 既存トップレベル投稿の本文を編集する（投稿後編集）。text/facets/langs だけ差し替え、
 * createdAt・embed・reply・channel・kossori 等は getRecord した値を保持したまま putRecord で
 * 書き戻す（同一 rkey → uri 不変・cid 変化）。Lexicon は変更していないため record に編集用
 * フィールドは足さない。「編集済み」判定は AppView が cid 変化を検知して行う。
 */
export async function updatePost(rkey: string, draft: PostDraft) {
	const s = current();
	const agent = new Agent(s);
	const { data } = await agent.com.atproto.repo.getRecord({
		repo: s.did,
		collection: POST,
		rkey,
	});
	const record: Record<string, unknown> = {
		...(data.value as Record<string, unknown>),
		$type: POST,
		text: draft.text,
		facets: draft.facets,
		langs: draft.langs,
	};
	return agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: POST,
		rkey,
		validate: false,
		record,
	});
}
export async function createReaction(
	subject: { uri: string; cid: string },
	emoji: string | EmojiView,
) {
	const s = current();
	const custom = typeof emoji === 'string' ? undefined : emoji;
	return new Agent(s).com.atproto.repo.createRecord({
		repo: s.did,
		collection: REACTION,
		validate: false,
		record: {
			$type: REACTION,
			subject,
			// カスタム絵文字では emoji はフォールバックテキスト（":name:"）。
			emoji: custom ? custom.name : (emoji as string).normalize('NFC'),
			...(custom ? { bluemoji: bluemojiRefOf(custom) } : {}),
			createdAt: new Date().toISOString(),
		},
	});
}
export async function deleteRecord(collection: string, rkey: string) {
	const s = current();
	return new Agent(s).com.atproto.repo.deleteRecord({ repo: s.did, collection, rkey });
}
/**
 * チャンネルを作成する。誰でも作成でき、作成者が所有者（レコードは作成者の PDS）。
 * banner はアバターと同じく AvatarCropper で切り出した webp Blob をアップロードして載せる。
 */
export async function createChannel(input: { name: string; description?: string; banner?: Blob }) {
	const s = current();
	const agent = new Agent(s);
	const banner = input.banner
		? (await agent.com.atproto.repo.uploadBlob(input.banner, { encoding: input.banner.type })).data
				.blob
		: undefined;
	return agent.com.atproto.repo.createRecord({
		repo: s.did,
		collection: CHANNEL,
		validate: false,
		record: {
			$type: CHANNEL,
			name: input.name,
			...(input.description ? { description: input.description } : {}),
			...(banner ? { banner } : {}),
			createdAt: new Date().toISOString(),
		},
	});
}
/**
 * チャンネルの表示情報を更新する。banner は undefined=維持、null=削除、Blob=差し替え。
 * 最新レコードを読み、createdAt・pinnedPost・未知の将来フィールドを保持したまま書き戻す。
 */
export async function updateChannel(
	rkey: string,
	input: { name: string; description?: string; banner?: Blob | null },
) {
	const s = current();
	const agent = new Agent(s);
	const banner =
		input.banner instanceof Blob
			? (await agent.com.atproto.repo.uploadBlob(input.banner, { encoding: input.banner.type }))
					.data.blob
			: input.banner;
	const { data } = await agent.com.atproto.repo.getRecord({
		repo: s.did,
		collection: CHANNEL,
		rkey,
	});
	const record: Record<string, unknown> = {
		...(data.value as Record<string, unknown>),
		$type: CHANNEL,
		name: input.name,
	};
	if (input.description) record.description = input.description;
	else delete record.description;
	if (banner === null) delete record.banner;
	else if (banner !== undefined) record.banner = banner;
	return agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: CHANNEL,
		rkey,
		validate: false,
		swapRecord: data.cid,
		record,
	});
}
/**
 * チャンネルのピンを設定・解除する。PDS はログイン中ユーザー自身の repo にしか書かないため、
 * チャンネル作成者以外が他人のチャンネルレコードを変更することはできない。
 */
export async function setChannelPinnedPost(
	rkey: string,
	pinnedPost?: { uri: string; cid: string },
) {
	const s = current();
	const agent = new Agent(s);
	const { data } = await agent.com.atproto.repo.getRecord({
		repo: s.did,
		collection: CHANNEL,
		rkey,
	});
	const record: Record<string, unknown> = {
		...(data.value as Record<string, unknown>),
		$type: CHANNEL,
	};
	if (pinnedPost) record.pinnedPost = pinnedPost;
	else delete record.pinnedPost;
	return agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: CHANNEL,
		rkey,
		validate: false,
		swapRecord: data.cid,
		record,
	});
}
/** チャンネル削除。所有者だけが自分の PDS のレコードを消せる。所属投稿は残る。 */
export async function deleteChannel(rkey: string) {
	return deleteRecord(CHANNEL, rkey);
}
export async function deleteAllNagiRecords() {
	const s = current();
	const agent = new Agent(s);
	for (const collection of [POST, REACTION, PROFILE, BLUEMOJI_ITEM]) {
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
