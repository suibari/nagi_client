import { getCachedTranslations, translatePosts } from '$lib/api/appview';
import type { FeedItem, PostView } from '$lib/api/types';
import { hasContentWarning } from '$lib/atproto/contentWarning';
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
export type TranslationPost = Pick<PostView, 'uri' | 'cid' | 'text'> & Partial<PostView>;

const CACHE_BATCH_SIZE = 50;
const MAX_CONCURRENT_TRANSLATIONS = 2;
const POST_URI = /^at:\/\/did:(?:plc|web):[^/]+\/com\.suibari\.nagi\.post\/[^/]+$/;
const keyOf = (uri: string, cid: string, target: SupportedLanguage) => `${uri}\n${cid}\n${target}`;

export function isTranslationCandidate(post: TranslationPost, target: SupportedLanguage) {
	const source = normalizeSupportedLanguage(post.langs?.[0]);
	return (
		POST_URI.test(post.uri) &&
		!post.optimisticState &&
		!post.deleted &&
		Boolean(post.text.trim()) &&
		!post.contentWarning &&
		!hasContentWarning(post.text) &&
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

class TranslationRequestPool {
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
		if (this.#active < MAX_CONCURRENT_TRANSLATIONS) {
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
	#translationRequests = new TranslationRequestPool();
	#target: SupportedLanguage | undefined;
	#controller: AbortController | undefined;

	entry(uri: string, cid: string, target = languagePreferences.translationLanguage) {
		return this.#entries.get(keyOf(uri, cid, target));
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
					const post = batch.find((candidate) => candidate.uri === translated.uri);
					if (!post) continue;
					const key = keyOf(translated.uri, post.cid, target);
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
			const existing = this.#entries.get(keyOf(post.uri, post.cid, target));
			if (existing?.status === 'loading') waiting.add(existing.promise);
			return !existing;
		});

		// TL先頭から1投稿ずつ投入し、最大2件を並行する。表示は完了順なので、
		// 長文が1枠を占有しても、もう1枠で後続の短文を進められる。
		for (const post of pending) {
			const request = this.#translationRequests
				.run(
					() =>
						translatePosts([post.uri], target, {
							signal,
						}),
					signal,
				)
				.then((result) => {
					if (signal.aborted) return;
					const translated = result.translations[0];
					this.#replace(
						keyOf(post.uri, post.cid, target),
						translated
							? { status: 'translated', text: translated.text }
							: { status: 'failed', code: result.failures[0]?.code },
					);
				})
				.catch(() => {
					if (signal.aborted) return;
					this.#replace(keyOf(post.uri, post.cid, target), { status: 'failed' });
				});
			this.#replace(keyOf(post.uri, post.cid, target), {
				status: 'loading',
				promise: request,
				...(normalizeSupportedLanguage(post.langs?.[0]) === 'en'
					? { english: { text: post.text, original: true } }
					: {}),
			});
			waiting.add(request);
		}
		if (target !== 'en') void this.#prepareEnglishFallbacks(pending, target, signal);
		await Promise.all(waiting);
	}

	async retry(post: TranslationPost) {
		const target = languagePreferences.translationLanguage;
		this.#replace(keyOf(post.uri, post.cid, target));
		await this.prepare([post]);
	}
}

export const postTranslations = new PostTranslations();
