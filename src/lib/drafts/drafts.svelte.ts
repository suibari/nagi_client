import type { ChannelSelection, EmojiSelection, MentionSelection } from '$lib/atproto/facets';
import type { LinkCardDraft } from '$lib/atproto/records';
import type { DraftContent, DraftSummary } from '$lib/api/types';
import {
	ApiRequestError,
	deleteDraft as deleteRemoteDraft,
	getDraft as getRemoteDraft,
	getDrafts as getRemoteDrafts,
	getChannel,
	getEmoji,
	putDraft as putRemoteDraft,
} from '$lib/api/appview';
import type { ImageAttachment } from '$lib/images';
import { preferences } from '$lib/preferences/preferences.svelte';
import {
	clearDrafts,
	deleteDraft as deleteLocalDraft,
	listDrafts,
	type StoredDraft,
} from './storage';

export type ComposerSnapshot = {
	text: string;
	attachments: ImageAttachment[];
	linkCards: LinkCardDraft[];
	mentions: MentionSelection[];
	channels: ChannelSelection[];
	emojis: EmojiSelection[];
	dismissedUrls: string[];
	quoteUri?: string;
};
export type DraftEntry =
	(DraftSummary & { storage: 'appview' }) | (StoredDraft & { storage: 'legacy-device' });

const remoteContent = (draft: StoredDraft | ComposerSnapshot): DraftContent => ({
	text: draft.text,
	mentions: draft.mentions,
	channels: (draft.channels ?? []).map(({ start, end, uri, name }) => ({ start, end, uri, name })),
	emojis: (draft.emojis ?? []).map(({ start, end, emoji }) => ({ start, end, uri: emoji.uri })),
	linkCards: draft.linkCards.map(({ uri, title, description }) => ({ uri, title, description })),
	dismissedUrls: draft.dismissedUrls,
	...(draft.quoteUri ? { quoteUri: draft.quoteUri } : {}),
});

class Drafts {
	entries = $state<DraftEntry[]>([]);
	#did: string | undefined;
	get count() {
		return this.entries.length;
	}

	async load(did: string | undefined) {
		this.#did = did;
		if (!did) {
			this.entries = [];
			return;
		}
		const local = await listDrafts(did);
		let remote: DraftSummary[] = [];
		try {
			remote = (await getRemoteDrafts()).drafts;
			for (const draft of local.filter((item) => item.images.length === 0)) {
				try {
					await putRemoteDraft({
						id: draft.id,
						content: remoteContent(draft),
						createdAt: draft.createdAt,
						updatedAt: draft.updatedAt,
					});
					await deleteLocalDraft(draft.id);
				} catch (error) {
					/* 成功したものだけ削除する。権限未反映時は端末原本を保持する。 */
					if (preferences.noteScopeError(error)) break;
				}
			}
			remote = (await getRemoteDrafts()).drafts;
		} catch (error) {
			preferences.noteScopeError(error);
			/* 新権限が使えない間も旧端末データは消さない。 */
		}
		if (this.#did !== did) return;
		const remainingLocal = await listDrafts(did);
		this.entries = [
			...remote.map((draft) => ({ ...draft, storage: 'appview' as const })),
			...remainingLocal.map((draft) => ({ ...draft, storage: 'legacy-device' as const })),
		].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	}

	async save(did: string, snapshot: ComposerSnapshot) {
		if (snapshot.attachments.length) throw new DraftStorageError('images');
		const now = new Date().toISOString();
		const id = crypto.randomUUID();
		try {
			const saved = await putRemoteDraft({
				id,
				content: remoteContent(snapshot),
				createdAt: now,
				updatedAt: now,
			});
			this.entries = [
				{
					id: saved.id,
					text: saved.text,
					linkCardCount: saved.linkCards.length,
					createdAt: saved.createdAt,
					updatedAt: saved.updatedAt,
					storage: 'appview',
				},
				...this.entries,
			];
		} catch (error) {
			preferences.noteScopeError(error);
			if (error instanceof ApiRequestError && error.code === 'draft_limit')
				throw new DraftStorageError('limit');
			throw error;
		}
	}

	async restore(id: string): Promise<StoredDraft | undefined> {
		const entry = this.entries.find((item) => item.id === id);
		if (!entry || !this.#did) return;
		let draft: StoredDraft;
		if (entry.storage === 'legacy-device') {
			draft = entry;
			await deleteLocalDraft(id);
		} else {
			const remote = await getRemoteDraft(id);
			const channels = (
				await Promise.all(
					remote.channels.map(async (selection) => {
						const result = await getChannel(selection.uri).catch(() => undefined);
						return result
							? ({ ...selection, ...result.channel, uri: selection.uri } as ChannelSelection)
							: undefined;
					}),
				)
			).filter((value): value is ChannelSelection => Boolean(value));
			const emojis = (
				await Promise.all(
					remote.emojis.map(async (selection) => {
						const result = await getEmoji(selection.uri).catch(() => undefined);
						return result
							? { start: selection.start, end: selection.end, emoji: result.emoji }
							: undefined;
					}),
				)
			).filter((value): value is EmojiSelection => Boolean(value));
			draft = {
				...remote,
				did: this.#did,
				mentions: remote.mentions as MentionSelection[],
				channels,
				emojis,
				images: [],
				linkCards: remote.linkCards,
			};
			await deleteRemoteDraft(id);
		}
		this.entries = this.entries.filter((item) => item.id !== id);
		return draft;
	}

	async remove(id: string) {
		const entry = this.entries.find((item) => item.id === id);
		if (!entry) return;
		if (entry.storage === 'legacy-device') await deleteLocalDraft(id);
		else await deleteRemoteDraft(id);
		this.entries = this.entries.filter((item) => item.id !== id);
	}

	/** AppView側は全データ削除済みなので、移行未完了の端末原本だけを消す。 */
	async clear(did: string) {
		await clearDrafts(did);
		if (this.#did === did) this.entries = [];
	}
}

export class DraftStorageError extends Error {
	constructor(readonly code: 'limit' | 'images') {
		super(code);
	}
}
export const drafts = new Drafts();
