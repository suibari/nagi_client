import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import {
	parsePostText,
	type ChannelSelection,
	type EmojiSelection,
	type MentionSelection,
} from './facets';
import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
import type { ImageAttachment, PostEditImage } from '$lib/images';
import type { EmojiView, NewsSubmissionPreview, PostImage } from '$lib/api/types';
import { BLUEMOJI_ITEM, bluemojiRefOf, NAGI_BLUEMOJI } from './bluemoji';
import { hasOptInScope } from '$lib/optin/scope-optin';
import { forgetPublicationCache } from '$lib/standardsite/cache';
import { deleteNagiStandardSiteRecords } from '$lib/standardsite/repo';
import { hasContentWarning } from './contentWarning';
import { BLUESKY_PROFILE_COLLECTION_SCOPE } from '$lib/oauth/client';
const POST = 'com.suibari.nagi.post',
	REACTION = 'com.suibari.nagi.reaction',
	PROFILE = 'com.suibari.nagi.profile',
	CHANNEL = 'com.suibari.nagi.channel';
const NEWS = 'com.suibari.nagi.news';
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

const BLUESKY_PROFILE = 'app.bsky.actor.profile';

export function normalizeProfileWebsite(value: string): string | undefined {
	const trimmed = value.trim();
	if (!trimmed) return '';
	const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
	try {
		const url = new URL(candidate);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
	} catch {
		return undefined;
	}
}

export async function hasBlueskyProfileScope(): Promise<boolean> {
	const s = get(session);
	if (!s) return false;
	try {
		const granted = (await s.getTokenInfo()).scope.split(' ');
		return granted.some(
			(scope) =>
				scope === BLUESKY_PROFILE_COLLECTION_SCOPE ||
				scope.startsWith(`${BLUESKY_PROFILE_COLLECTION_SCOPE}?`),
		);
	} catch {
		return false;
	}
}

async function getOwnBlueskyProfileRecord(): Promise<Record<string, unknown> | null> {
	const s = current();
	try {
		const response = await new Agent(s).com.atproto.repo.getRecord({
			repo: s.did,
			collection: BLUESKY_PROFILE,
			rkey: 'self',
		});
		return response.data.value as Record<string, unknown>;
	} catch (error) {
		if (isRecordNotFound(error)) return null;
		throw error;
	}
}

export async function getOwnBlueskyWebsite(): Promise<string> {
	const record = await getOwnBlueskyProfileRecord();
	return typeof record?.website === 'string' ? record.website : '';
}

export async function putOwnBlueskyWebsite(value: string): Promise<void> {
	const website = normalizeProfileWebsite(value);
	if (website === undefined) throw new Error('Invalid website URL');
	const s = current();
	const existing = await getOwnBlueskyProfileRecord();
	if (!existing && !website) return;
	const record: Record<string, unknown> = {
		...(existing ?? {}),
		$type: BLUESKY_PROFILE,
		...(existing?.createdAt ? {} : { createdAt: new Date().toISOString() }),
	};
	if (website) record.website = website;
	else delete record.website;
	await new Agent(s).com.atproto.repo.putRecord({
		repo: s.did,
		collection: BLUESKY_PROFILE,
		rkey: 'self',
		validate: false,
		record,
	});
}
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
	/** 作成時からCW運用であり、外部コピーを永久に作らない投稿。 */
	cwRestricted?: boolean;
};

export function preparePostDraft(
	text: string,
	reply?: PostDraft['reply'],
	quote?: PostDraft['quote'],
	attachments: ImageAttachment[] = [],
	linkCards: LinkCardDraft[] = [],
	mentions: MentionSelection[] = [],
	channels: ChannelSelection[] = [],
	emojis: EmojiSelection[] = [],
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
		channels.map((selected) => ({
			...selected,
			start: selected.start - leadingWhitespace,
			end: selected.end - leadingWhitespace,
		})),
		emojis.map((selection) => ({
			...selection,
			start: selection.start - leadingWhitespace,
			end: selection.end - leadingWhitespace,
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
		...(hasContentWarning(parsed.text) || attachments.some((image) => image.contentWarning)
			? { cwRestricted: true }
			: {}),
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
	images: {
		image: unknown;
		alt: string;
		contentWarning?: boolean;
		aspectRatio: { width: number; height: number };
	}[];
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
				...(attachment.contentWarning ? { contentWarning: true } : {}),
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
			...(draft.cwRestricted && { cwRestricted: true }),
			...(draft.kossori && { kossori: true }),
			...(draft.channel && { channel: draft.channel }),
			...(draft.channel && draft.channelOnly && { channelOnly: true }),
			...(draft.reply && { reply: draft.reply }),
			// ニュース記事そのものは引用カードで描画し、本文中の別URLだけがここへ入る。
			...(cards.length && { linkCards: cards }),
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
type StoredPostImage = {
	image: unknown;
	alt: string;
	contentWarning?: boolean;
	aspectRatio?: { width: number; height: number };
};

function blobCid(blob: unknown): string | undefined {
	if (!blob || typeof blob !== 'object') return undefined;
	const ref = (blob as { ref?: unknown }).ref;
	if (typeof ref === 'object' && ref !== null && '$link' in ref) {
		const link = (ref as { $link?: unknown }).$link;
		if (typeof link === 'string') return link;
	}
	if (ref && typeof (ref as { toString?: unknown }).toString === 'function') {
		const cid = (ref as { toString: () => string }).toString();
		if (cid && cid !== '[object Object]') return cid;
	}
	return undefined;
}

/**
 * 既存投稿の本文と画像を編集する。既存画像は getRecord した BlobRef を再利用し、
 * 新規画像だけアップロードする。createdAt・reply・channel・kossori 等のフィールドは保持する。
 */
export async function updatePost(rkey: string, draft: PostDraft, images?: PostEditImage[]) {
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
	const cwRestricted = record.cwRestricted === true;
	if (
		!cwRestricted &&
		(hasContentWarning(draft.text) || images?.some((image) => image.contentWarning))
	) {
		throw new Error('Content warnings can only be edited on posts that started with a warning');
	}
	if (cwRestricted) record.cwRestricted = true;
	let imageViews: PostImage[] | undefined;
	if (images !== undefined) {
		if (images.length > 4) throw new Error('A post can contain at most four images');
		const embed =
			record.embed && typeof record.embed === 'object'
				? ({ ...(record.embed as Record<string, unknown>) } as Record<string, unknown>)
				: undefined;
		const embedType = typeof embed?.$type === 'string' ? embed.$type : undefined;
		const storedImages = Array.isArray(embed?.images) ? (embed.images as StoredPostImage[]) : [];
		const existingIndexes = images
			.filter(
				(image): image is Extract<PostEditImage, { kind: 'existing' }> => image.kind === 'existing',
			)
			.map((image) => image.sourceIndex);
		if (
			new Set(existingIndexes).size !== existingIndexes.length ||
			existingIndexes.some(
				(index) => !Number.isInteger(index) || index < 0 || index >= storedImages.length,
			)
		) {
			throw new Error('The existing image order is invalid');
		}

		const uploaded = new Map<string, { stored: StoredPostImage; view: PostImage }>();
		await Promise.all(
			images
				.filter((image): image is Extract<PostEditImage, { kind: 'new' }> => image.kind === 'new')
				.map(async (image) => {
					const response = await agent.com.atproto.repo.uploadBlob(image.blob, {
						encoding: image.blob.type,
					});
					const cid = blobCid(response.data.blob);
					if (!cid) throw new Error('Could not resolve the uploaded image');
					uploaded.set(image.id, {
						stored: {
							image: response.data.blob,
							alt: image.alt,
							...(image.contentWarning ? { contentWarning: true } : {}),
							aspectRatio: image.aspectRatio,
						},
						view: {
							url: `/api/blob/${encodeURIComponent(s.did)}/${encodeURIComponent(cid)}`,
							alt: image.alt,
							...(image.contentWarning ? { contentWarning: true } : {}),
							aspectRatio: image.aspectRatio,
						},
					});
				}),
		);

		const orderedImages = images.map((image): StoredPostImage => {
			if (image.kind === 'new') {
				const result = uploaded.get(image.id);
				if (!result) throw new Error('The uploaded image is unavailable');
				return result.stored;
			}
			const stored = storedImages[image.sourceIndex];
			const updated: StoredPostImage = {
				...stored,
				alt: image.alt,
				...(image.aspectRatio ? { aspectRatio: image.aspectRatio } : {}),
			};
			if (image.contentWarning) updated.contentWarning = true;
			else delete updated.contentWarning;
			return updated;
		});
		imageViews = images.map((image): PostImage => {
			if (image.kind === 'new') {
				const result = uploaded.get(image.id);
				if (!result) throw new Error('The uploaded image is unavailable');
				return result.view;
			}
			return {
				url: image.previewUrl,
				alt: image.alt,
				...(image.contentWarning ? { contentWarning: true } : {}),
				...(image.aspectRatio ? { aspectRatio: image.aspectRatio } : {}),
			};
		});

		if (embed && embedType === `${POST}#quote`) {
			if (orderedImages.length) embed.images = orderedImages;
			else delete embed.images;
			record.embed = embed;
		} else if (orderedImages.length) {
			if (embedType && embedType !== `${POST}#images`) {
				throw new Error('This post embed does not support images');
			}
			record.embed = { $type: `${POST}#images`, images: orderedImages };
		} else if (embedType === `${POST}#images`) {
			delete record.embed;
		}
	}

	const response = await agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: POST,
		rkey,
		validate: false,
		record,
	});
	return { response, imageViews };
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
export async function createNewsRecord(preview: NewsSubmissionPreview) {
	const s = current();
	return new Agent(s).com.atproto.repo.createRecord({
		repo: s.did,
		collection: NEWS,
		validate: false,
		record: {
			$type: NEWS,
			articleId: preview.articleId,
			url: preview.url,
			titleJa: preview.title,
			sourceName: preview.sourceName,
			sourceUrl: preview.sourceUrl,
			...(preview.publishedAt ? { publishedAt: preview.publishedAt } : {}),
			langs: ['ja'],
			createdAt: new Date().toISOString(),
		},
	});
}

export async function deleteOwnNews(uri: string) {
	const s = current();
	const prefix = `at://${s.did}/${NEWS}/`;
	const rkey = uri.startsWith(prefix) ? uri.slice(prefix.length) : '';
	if (!rkey || rkey.includes('/')) throw new Error('News record owner does not match');
	return new Agent(s).com.atproto.repo.deleteRecord({ repo: s.did, collection: NEWS, rkey });
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
	const trackedBluemoji: Array<{ rkey: string; subject?: unknown }> = [];
	let bluemojiCursor: string | undefined;
	do {
		const response = await agent.com.atproto.repo.listRecords({
			repo: s.did,
			collection: NAGI_BLUEMOJI,
			limit: 100,
			cursor: bluemojiCursor,
		});
		for (const record of response.data.records) {
			trackedBluemoji.push({
				rkey: record.uri.slice(record.uri.lastIndexOf('/') + 1),
				subject: (record.value as { subject?: unknown }).subject,
			});
		}
		bluemojiCursor = response.data.cursor;
	} while (bluemojiCursor);
	for (const marker of trackedBluemoji) {
		const expectedSubject = `at://${s.did}/${BLUEMOJI_ITEM}/${marker.rkey}`;
		// 壊れた、または別レコードを指すサイドカーから無関係な Bluemoji を消さない。
		if (marker.subject === expectedSubject) {
			try {
				await agent.com.atproto.repo.deleteRecord({
					repo: s.did,
					collection: BLUEMOJI_ITEM,
					rkey: marker.rkey,
				});
			} catch (error) {
				// 本体を個別削除済みなら、孤立したサイドカーの掃除だけ続ける。
				if (!isRecordNotFound(error)) throw error;
			}
		}
		await agent.com.atproto.repo.deleteRecord({
			repo: s.did,
			collection: NAGI_BLUEMOJI,
			rkey: marker.rkey,
		});
	}
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
	// standard.site は Nagi 専用のコレクションではなく、他アプリ（blento.app など）の
	// publication / document が同居しうる。コレクションごと消さず、Nagi が作った分だけ消す。
	// 権限が無いユーザーでは listRecords/deleteRecord が失敗するため、事前に判定する。
	if (await hasOptInScope('standardSite')) {
		await deleteNagiStandardSiteRecords();
	}
	forgetPublicationCache(s.did);
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
