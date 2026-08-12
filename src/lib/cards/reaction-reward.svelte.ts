import { drawCard } from '$lib/api/appview';
import type { DrawCardResult } from '$lib/api/types';
import { reachedCardMilestone } from './celebration';
import { cardCollections } from './collection.svelte';
import { session } from '$lib/oauth/session.svelte';

type Reward = {
	did: string;
	draw: DrawCardResult;
	milestone?: number;
};

class ReactionCardReward {
	current = $state<Reward>();
	error = $state('');
	busy = $state(false);
	#retry: { did: string; reactionUri: string } | undefined;
	#queue: Promise<void> = Promise.resolve();
	#did: string | undefined;

	constructor() {
		session.subscribe((value) => {
			const did = value?.did;
			if (did === this.#did) return;
			this.#did = did;
			this.current = undefined;
			this.error = '';
			this.#retry = undefined;
		});
	}

	claim(did: string, reactionUri: string): void {
		if (cardCollections.selfDrawStatus?.reaction?.canDraw === false) return;
		// 連続リアクションでも最初の取得結果を上書きしないよう、サーバ呼び出しを直列化する。
		this.#queue = this.#queue.then(() => this.#claim(did, reactionUri)).catch(() => undefined);
	}

	async #claim(did: string, reactionUri: string): Promise<void> {
		if (this.#did !== did || cardCollections.selfDrawStatus?.reaction?.canDraw === false) return;
		this.busy = true;
		this.error = '';
		try {
			const before = cardCollections.view(did);
			const result = await drawCard({ source: 'reaction', reactionUri });
			if (this.#did !== did) return;
			cardCollections.applyDraw(did, result);
			this.#retry = undefined;
			// 2枚目以降のリアクションでは、取得済みカードを何度も開かない。
			if (result.alreadyDrawn) return;
			this.current = {
				did,
				draw: result,
				milestone: reachedCardMilestone(before?.ownedCount, before?.totalCount, result),
			};
		} catch (error) {
			if (this.#did !== did) return;
			this.#retry = { did, reactionUri };
			this.error = error instanceof Error ? error.message : '';
		} finally {
			this.busy = false;
		}
	}

	retry(): void {
		if (this.#retry) this.claim(this.#retry.did, this.#retry.reactionUri);
	}

	closeCard(): void {
		this.current = undefined;
	}

	clearError(): void {
		this.error = '';
		this.#retry = undefined;
	}
}

export const reactionCardReward = new ReactionCardReward();
