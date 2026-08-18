import {
	createGuestAffirmation,
	deleteGuestAffirmation,
	getGuestAffirmation,
} from '$lib/api/appview';
import { deleteGuestPost, listGuestPosts, putGuestPost, type StoredGuestPost } from './storage';

const POLL_MS = 2_000;
const MAX_POLLS = 45;

class GuestPosts {
	entries = $state<StoredGuestPost[]>([]);
	ready = $state(false);

	async load() {
		this.entries = await listGuestPosts();
		this.ready = true;
		for (const post of this.entries) {
			if (post.status === 'pending' && post.request) void this.poll(post.id);
		}
	}

	async create(text: string, language: 'ja' | 'en') {
		const post: StoredGuestPost = {
			id: crypto.randomUUID(),
			text: text.trim(),
			createdAt: new Date().toISOString(),
			language,
			status: 'pending',
		};
		this.entries = [post, ...this.entries];
		await putGuestPost(post);
		try {
			post.request = await createGuestAffirmation(post.text, language);
			await this.replace(post);
			void this.poll(post.id);
		} catch {
			post.status = 'failed';
			await this.replace(post);
		}
		return post.id;
	}

	async retry(id: string) {
		const post = this.entries.find((entry) => entry.id === id);
		if (!post || post.status !== 'failed') return;
		post.status = 'pending';
		delete post.request;
		await this.replace(post);
		try {
			post.request = await createGuestAffirmation(post.text, post.language);
			await this.replace(post);
			void this.poll(post.id);
		} catch {
			post.status = 'failed';
			await this.replace(post);
		}
	}

	async remove(id: string) {
		const post = this.entries.find((entry) => entry.id === id);
		if (post?.request) void deleteGuestAffirmation(post.request).catch(() => undefined);
		await deleteGuestPost(id);
		this.entries = this.entries.filter((entry) => entry.id !== id);
	}

	private async poll(id: string) {
		for (let count = 0; count < MAX_POLLS; count += 1) {
			const post = this.entries.find((entry) => entry.id === id);
			if (!post || post.status !== 'pending' || !post.request) return;
			if (count) await new Promise((resolve) => globalThis.setTimeout(resolve, POLL_MS));
			try {
				const result = await getGuestAffirmation(post.request);
				if (result.state === 'posted' && result.reply) {
					post.reply = result.reply;
					post.status = 'posted';
					const request = post.request;
					delete post.request;
					await this.replace(post);
					void deleteGuestAffirmation(request).catch(() => undefined);
					return;
				}
				if (result.state === 'failed') break;
			} catch {
				// 一時的なオフラインでは端末内の投稿を残し、次のポーリングで再試行する。
			}
		}
		const post = this.entries.find((entry) => entry.id === id);
		if (post?.status === 'pending') {
			post.status = 'failed';
			await this.replace(post);
		}
	}

	private async replace(post: StoredGuestPost) {
		await putGuestPost($state.snapshot(post));
		this.entries = this.entries.map((entry) => (entry.id === post.id ? { ...post } : entry));
	}
}

export const guestPosts = new GuestPosts();
