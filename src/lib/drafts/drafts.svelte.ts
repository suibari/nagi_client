import type { MentionSelection } from '$lib/atproto/facets';
import type { LinkCardDraft } from '$lib/atproto/records';
import type { ImageAttachment } from '$lib/images';
import { clearDrafts, deleteDraft, listDrafts, putDraft, type StoredDraft } from './storage';

/** Composer が持っている編集中の状態。previewUrl は保存対象外。 */
export type ComposerSnapshot = {
	text: string;
	attachments: ImageAttachment[];
	linkCards: LinkCardDraft[];
	mentions: MentionSelection[];
	dismissedUrls: string[];
};

class Drafts {
	entries = $state<StoredDraft[]>([]);
	#did: string | undefined;

	get count() {
		return this.entries.length;
	}

	/** サインイン中の DID が変わったら読み直す。DID なしなら空にする。 */
	async load(did: string | undefined) {
		this.#did = did;
		this.entries = did ? await listDrafts(did) : [];
	}

	async save(did: string, snapshot: ComposerSnapshot) {
		const now = new Date().toISOString();
		const draft: StoredDraft = $state.snapshot({
			id: crypto.randomUUID(),
			did,
			text: snapshot.text,
			mentions: snapshot.mentions,
			images: snapshot.attachments.map(({ id, blob, alt, aspectRatio }) => ({
				id,
				blob,
				alt,
				aspectRatio,
			})),
			linkCards: snapshot.linkCards.map(({ uri, title, description, thumbnail }) => ({
				uri,
				title,
				description,
				thumbnail,
			})),
			dismissedUrls: snapshot.dismissedUrls,
			createdAt: now,
			updatedAt: now,
		}) as StoredDraft;
		await putDraft(draft);
		this.entries = [draft, ...this.entries];
	}

	/**
	 * 復元した下書きは一覧から取り出す（X / Bluesky と同じ挙動）。
	 * 呼び出し側で previewUrl を作り直すこと。
	 */
	async restore(id: string): Promise<StoredDraft | undefined> {
		const draft = this.entries.find((entry) => entry.id === id);
		if (!draft) return undefined;
		await deleteDraft(id);
		this.entries = this.entries.filter((entry) => entry.id !== id);
		return draft;
	}

	async remove(id: string) {
		await deleteDraft(id);
		this.entries = this.entries.filter((entry) => entry.id !== id);
	}

	async clear(did: string) {
		await clearDrafts(did);
		if (this.#did === did) this.entries = [];
	}
}

export const drafts = new Drafts();
