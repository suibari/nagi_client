import { getCachedTranslations, translatePosts } from '$lib/api/appview';
import type { FeedItem, PostView } from '$lib/api/types';
import {
	languagePreferences,
	normalizeSupportedLanguage,
	type SupportedLanguage,
} from './languagePreferences.svelte';

export type PostTranslationState =
	| {
			status: 'loading';
			promise: Promise<void>;
			english?: { text: string; original: boolean };
	  }
	| { status: 'translated'; text: string }
	| { status: 'failed'; code?: string };
export type TranslationPost = Pick<PostView, 'uri' | 'text'> & Partial<PostView>;

const BATCH_SIZE = 4;
const CACHE_BATCH_SIZE = 50;
const MAX_CONCURRENT_BATCHES = 2;
const POST_URI = /^at:\/\/did:(?:plc|web):[^/]+\/com\.suibari\.nagi\.post\/[^/]+$/;
const keyOf = (uri: string, target: SupportedLanguage) => `${uri}\n${target}`;

export function isTranslationCandidate(post: TranslationPost, target: SupportedLanguage) {
	const source = normalizeSupportedLanguage(post.langs?.[0]);
	return (
		POST_URI.test(post.uri) &&
		!post.optimisticState &&
		!post.deleted &&
		Boolean(post.text.trim()) &&
		Boolean(source) &&
		source !== target
	);
}

/** ThreadUnit の描画順（会話、表示中バブル、通常投稿、引用）で重複なく並べる。 */
export function collectPostTranslations(posts: TranslationPost[]): TranslationPost[] {
	const found = new Map<string, TranslationPost>();
	const visitPost = (post?: TranslationPost) => {
		if (!post || found.has(post.uri)) return;
		found.set(post.uri, post);
		if (post.quote?.kind === 'post') visitPost(post.quote.post);
	};
	for (const post of posts) {
		const feed = post as Partial<FeedItem>;
		if (feed.conversation) {
			visitPost(feed.conversation.root);
			for (const bubble of feed.conversation.bubbles) visitPost(bubble.post);
			visitPost(post);
		} else {
			visitPost(feed.replyParent);
			visitPost(post);
			visitPost(feed.botReply);
		}
	}
	return [...found.values()];
}

class BatchRequestPool {
	#active = 0;
	#waiting: Array<() => void> = [];

	async run<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
		await this.#acquire();
		try {
			if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError');
			return await task();
		} finally {
			this.#release();
		}
	}

	#acquire(): Promise<void> {
		if (this.#active < MAX_CONCURRENT_BATCHES) {
			this.#active += 1;
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			this.#waiting.push(() => {
				this.#active += 1;
				resolve();
			});
		});
	}

	#release() {
		this.#active -= 1;
		this.#waiting.shift()?.();
	}
}

class PostTranslations {
	#entries = $state(new Map<string, PostTranslationState>());
	#queued = new Map<string, TranslationPost>();
	#ensureScheduled = false;
	#batchRequests = new BatchRequestPool();
	#target: SupportedLanguage | undefined;
	#controller: AbortController | undefined;

	entry(uri: string, target = languagePreferences.translationLanguage) {
		return this.#entries.get(keyOf(uri, target));
	}

	#replace(key: string, state?: PostTranslationState) {
		const next = new Map(this.#entries);
		if (state) next.set(key, state);
		else next.delete(key);
		this.#entries = next;
	}

	cancelPending() {
		this.#controller?.abort();
		this.#controller = undefined;
		this.#target = undefined;
		this.#entries = new Map([...this.#entries].filter(([, state]) => state.status !== 'loading'));
	}

	syncPreferences(target: SupportedLanguage, enabled: boolean) {
		if (!enabled || (this.#target && this.#target !== target)) this.cancelPending();
	}

	#signal(target: SupportedLanguage) {
		if (!this.#controller || this.#controller.signal.aborted || this.#target !== target) {
			this.cancelPending();
			this.#target = target;
			this.#controller = new AbortController();
		}
		return this.#controller.signal;
	}

	async #prepareEnglishFallbacks(
		posts: TranslationPost[],
		target: SupportedLanguage,
		signal: AbortSignal,
	): Promise<void> {
		const candidates = posts.filter((post) => normalizeSupportedLanguage(post.langs?.[0]) !== 'en');
		for (let offset = 0; offset < candidates.length; offset += CACHE_BATCH_SIZE) {
			const batch = candidates.slice(offset, offset + CACHE_BATCH_SIZE);
			try {
				const result = await getCachedTranslations(
					batch.map((post) => post.uri),
					'en',
					signal,
				);
				if (signal.aborted) return;
				for (const translated of result.translations) {
					const key = keyOf(translated.uri, target);
					const existing = this.#entries.get(key);
					if (existing?.status !== 'loading') continue;
					this.#replace(key, {
						...existing,
						english: { text: translated.text, original: false },
					});
				}
			} catch {
				if (signal.aborted) return;
				// 英訳キャッシュが読めなくても、最終翻訳はそのまま継続する。
			}
		}
	}

	/** コンポーネントから同じtickに来た例外的な要求も、投稿ごとの個別APIに戻さずまとめる。 */
	ensure(post: TranslationPost) {
		this.#queued.set(post.uri, post);
		if (this.#ensureScheduled) return;
		this.#ensureScheduled = true;
		queueMicrotask(() => {
			this.#ensureScheduled = false;
			const posts = [...this.#queued.values()];
			this.#queued.clear();
			void this.prepare(posts);
		});
	}

	async prepare(posts: TranslationPost[]): Promise<void> {
		if (!languagePreferences.autoTranslate) return;
		const target = languagePreferences.translationLanguage;
		const signal = this.#signal(target);
		const candidates = collectPostTranslations(posts).filter((post) =>
			isTranslationCandidate(post, target),
		);
		const waiting = new Set<Promise<void>>();
		const pending = candidates.filter((post) => {
			const existing = this.#entries.get(keyOf(post.uri, target));
			if (existing?.status === 'loading') waiting.add(existing.promise);
			return !existing;
		});

		// APIリクエストは最大2バッチを並行させるが、後続バッチが先に完了しても
		// TL上の並び（最新側）を飛び越えて表示しない。
		let previousBatch = Promise.resolve();
		for (let offset = 0; offset < pending.length; offset += BATCH_SIZE) {
			const batch = pending.slice(offset, offset + BATCH_SIZE);
			const result = this.#batchRequests
				.run(
					() =>
						translatePosts(
							batch.map((post) => post.uri),
							target,
							{ signal },
						),
					signal,
				)
				.then(
					(response) => ({ ok: true as const, response }),
					() => ({ ok: false as const }),
				);
			const request = previousBatch.then(async () => {
				if (signal.aborted) return;
				const outcome = await result;
				if (signal.aborted) return;
				if (outcome.ok) {
					const translated = new Map(
						outcome.response.translations.map((item) => [item.uri, item.text]),
					);
					const failed = new Map(outcome.response.failures.map((item) => [item.uri, item.code]));
					for (const post of batch) {
						const text = translated.get(post.uri);
						this.#replace(
							keyOf(post.uri, target),
							text
								? { status: 'translated', text }
								: { status: 'failed', code: failed.get(post.uri) },
						);
					}
				} else {
					for (const post of batch) {
						this.#replace(keyOf(post.uri, target), { status: 'failed' });
					}
				}
			});
			previousBatch = request;
			for (const post of batch) {
				this.#replace(keyOf(post.uri, target), {
					status: 'loading',
					promise: request,
					...(normalizeSupportedLanguage(post.langs?.[0]) === 'en'
						? { english: { text: post.text, original: true } }
						: {}),
				});
			}
			waiting.add(request);
		}
		if (target !== 'en') void this.#prepareEnglishFallbacks(pending, target, signal);
		await Promise.all(waiting);
	}

	async retry(post: TranslationPost) {
		const target = languagePreferences.translationLanguage;
		this.#replace(keyOf(post.uri, target));
		await this.prepare([post]);
	}
}

export const postTranslations = new PostTranslations();
