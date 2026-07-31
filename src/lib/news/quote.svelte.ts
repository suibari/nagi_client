import { get } from 'svelte/store';
import type { NewsView } from '$lib/api/types';
import {
	createPost,
	preparePostDraft,
	uploadPostAssets,
	type LinkCardDraft,
} from '$lib/atproto/records';
import {
	validChannelSelections,
	type ChannelSelection,
	type MentionSelection,
} from '$lib/atproto/facets';
import type { ImageAttachment } from '$lib/images';
import { m } from '$lib/i18n/i18n.svelte';
import { session } from '$lib/oauth/session.svelte';

/**
 * ニュースを引用して投稿するときの状態。
 *
 * ニュース一覧のカード（NewsCard）と my Nagi の1行表示（NewsTicker）の両方が同じ
 * 引用機能を持つので、状態と送信をここに集約する。ボタンと入力欄は DOM 上で
 * 離れた位置に出るため、コンポーネントではなくクラスとして切り出している。
 */
export class NewsQuote {
	composing = $state(false);
	text = $state('');
	busy = $state(false);
	error = $state('');
	attachments = $state<ImageAttachment[]>([]);
	linkCards = $state<LinkCardDraft[]>([]);
	mentions = $state<MentionSelection[]>([]);
	channels = $state<ChannelSelection[]>([]);

	get empty() {
		return !this.text.trim() && !this.attachments.length && !this.linkCards.length;
	}

	/** 未サインインならログインへ送る。開いている状態でもう一度押したら閉じる。 */
	toggle() {
		if (!get(session)) {
			location.href = '/login';
			return;
		}
		this.error = '';
		if (this.composing) this.cancel();
		else this.composing = true;
	}

	clear() {
		this.text = '';
		this.attachments = [];
		this.linkCards = [];
		this.mentions = [];
		this.channels = [];
	}

	cancel() {
		this.composing = false;
		this.clear();
	}

	async submit(news: NewsView) {
		if (!get(session) || this.empty || this.busy) return;
		this.busy = true;
		this.error = '';
		const selectedChannel = validChannelSelections(this.text, this.channels)[0];
		const draft = preparePostDraft(
			this.text,
			undefined,
			{ uri: news.uri, cid: news.cid },
			this.attachments,
			this.linkCards,
			this.mentions,
			this.channels,
			false,
			selectedChannel ? { uri: selectedChannel.uri, cid: selectedChannel.cid } : undefined,
		);
		try {
			const assets = await uploadPostAssets(draft);
			// ニュース引用もNagi内レコードを参照するため、Blueskyへはクロスポストしない。
			await createPost(draft, assets);
			this.clear();
			this.composing = false;
		} catch (e) {
			this.error = e instanceof Error ? e.message : m.postFailed();
		} finally {
			this.busy = false;
		}
	}
}
