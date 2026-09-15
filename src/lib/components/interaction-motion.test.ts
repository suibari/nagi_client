import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const feed = read('../feed/feed.svelte.ts');
const feedShell = read('./FeedShell.svelte');
const threadUnit = read('./ThreadUnit.svelte');
const threadPage = read('../../routes/thread/[did]/[rkey]/+page.svelte');
const chatBubble = read('./ChatBubble.svelte');
const postFollow = read('../feed/post-follow.svelte.ts');
const notice = read('./PostFollowNotice.svelte');
const unavailableNotice = read('./PostUnavailableNotice.svelte');
const quoteCard = read('./QuoteCard.svelte');
const componentsCss = read('../../routes/styles/components.css');
const baseCss = read('../../routes/styles/base.css');
const devPreview = read('../../routes/dev/interactions/+page.svelte');
const devGuard = read('../../routes/dev/interactions/+page.ts');
const newPostsButton = read('./NewPostsButton.svelte');
const ja = read('../i18n/ja.ts');
const en = read('../i18n/en.ts');

describe('interaction motion contracts', () => {
	it('animates only items discovered by refresh, not the initial feed load', () => {
		expect(feed).toContain('this.#markEntering(visuallyFresh, freshPostUris);');
		expect(feedShell).toContain('entering={feed.isEntering(item)}');
		expect(feedShell).toContain('isPostEntering={(uri) => feed.isPostEntering(uri)}');
		expect(threadUnit).toContain('class:feed-entering={entering}');
		expect(componentsCss).toMatch(/@keyframes feed-slide-in[\s\S]*translateY\(-42px\)/);
	});

	it('offers a new-post button only for background additions away from the top', () => {
		expect(feed).toContain('newItemsVersion = $state(0)');
		expect(feed).toContain('if (items.length) this.newItemsVersion += 1;');
		expect(feed).toContain('const visuallyFresh = fresh.filter');
		expect(feedShell).toContain("if (typeof window !== 'undefined' && window.scrollY > 24)");
		expect(feedShell).toContain('<NewPostsButton visible={newPostsAvailable}');
		expect(feedShell).toContain("behavior: matchMedia('(prefers-reduced-motion: reduce)').matches");
		expect(newPostsButton).toContain('m.newPostsAvailable()');
		expect(ja).toContain("newPostsAvailable: '新しいポストがあります'");
		expect(en).toContain("newPostsAvailable: 'New posts are available'");
	});

	it('slides newly polled replies upward while post-follow tracks submitted replies', () => {
		expect(threadUnit).toContain('isPostEntering(bubble.post.uri)');
		expect(threadPage).toContain('class:message-entering={enteringReplyUris.has(reply.uri)}');
		expect(componentsCss).toMatch(/@keyframes reply-slide-up[\s\S]*translateY\(52px\)/);
		expect(postFollow).toContain("scrollIntoView({ behavior: scrollBehavior(), block: 'start' })");
	});

	it('shows an optimistic reply even when the visible thread is not grouped', () => {
		expect(feed).toContain('containingItem.get(reply.parent.uri)');
		expect(feed).toContain('containingItem.get(reply.root.uri)');
		expect(feed).toContain('target || this.#optimisticFilter(pending)');
	});

	it('animates the actual post bubble from its avatar for sending and completion', () => {
		expect(chatBubble).toContain("class:bubble-sending={post.optimisticState === 'sending'}");
		expect(chatBubble).toContain("class:bubble-created={post.optimisticState === 'indexing'}");
		expect(chatBubble).toMatch(/post\.optimisticState === 'indexing'[\s\S]*m\.postCreated\(\)/);
		expect(chatBubble).toMatch(/@keyframes bubble-sprout[\s\S]*scale\(0\.28\)/);
		expect(chatBubble).toMatch(/@keyframes bubble-settle[\s\S]*scale\(1\.025\)/);
	});

	it('keeps the original bottom post-follow notice presentation', () => {
		expect(notice).toContain('<aside class="post-follow-notice"');
		expect(notice).not.toContain('post-notice-avatar');
		expect(postFollow).not.toContain('postFollowNotice.sending();');
	});

	// 判定は非同期なので、投稿直後に結果は出ない。ポーリングで追いかけるのはやめ、
	// 次に開いたときの墓標だけで「削除された」と「保存を拒否された」を区別する。
	it('distinguishes a rejected post from a deleted one without polling', () => {
		expect(postFollow).not.toContain('getPostStatus');
		expect(chatBubble).toContain('reason={post.unavailableReason}');
		expect(quoteCard).toContain('reason={post.unavailableReason}');
		expect(unavailableNotice).toContain("reason === 'moderation-policy'");
		expect(unavailableNotice).toContain("reason === 'processing-failed'");
	});

	// 「投稿の正本はあなたのPDSに残っています」は投稿者本人にしか成り立たない。
	// スレッド内の他人の返信や引用先で出ると、事実と違う案内になる。
	it('shows the PDS note only to the author of the unavailable post', () => {
		expect(unavailableNotice).toContain('$session?.did === authorDid');
		expect(unavailableNotice).toContain('{#if showPdsNote}<p>{m.postModerationPdsNote()}</p>{/if}');
		expect(chatBubble).toContain('authorDid={post.author.did}');
		expect(quoteCard).toContain('authorDid={post.author.did}');
	});

	it('retains the global reduced-motion override for every new animation', () => {
		expect(baseCss).toMatch(
			/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation:\s*none !important;/,
		);
	});

	it('offers an API-free development preview and excludes it from production', () => {
		expect(devPreview).toContain('API・PDS・AppViewへは送信しません');
		expect(devPreview).toContain('<ChatBubble post={basicPost} displayOnly />');
		expect(devPreview).toContain(
			'<ChatBubble post={translatedPost} {translatedText} displayOnly clampLines={3} />',
		);
		expect(devPreview).toContain('<ReactionStamp');
		expect(devPreview).toContain('<ThreadUnit');
		expect(devPreview).toContain('<NewPostsButton');
		expect(devPreview).toContain('function previewPosting()');
		expect(devPreview).toContain("optimisticState: 'sending'");
		expect(devPreview).toContain("optimisticState: 'indexing'");
		expect(devPreview).toContain('scrollToElement(replyPreview);');
		expect(devPreview).toContain('class="timeline mock-output" inert');
		expect(devPreview).not.toMatch(/createPost|createReaction|ensureRecord|fetch\(/);
		expect(devGuard).toContain("if (!dev) error(404, 'Not found')");
	});
});
