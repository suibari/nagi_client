import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const api = readFileSync(new URL('../api/appview.ts', import.meta.url), 'utf8');
const store = readFileSync(new URL('./guest-posts.svelte.ts', import.meta.url), 'utf8');
const section = readFileSync(
	new URL('../components/GuestPostSection.svelte', import.meta.url),
	'utf8',
);
const signedInModal = readFileSync(
	new URL('../components/PostModal.svelte', import.meta.url),
	'utf8',
);
const guestModal = readFileSync(
	new URL('../components/GuestPostModal.svelte', import.meta.url),
	'utf8',
);
const accountCard = readFileSync(
	new URL('../components/shell/AccountCard.svelte', import.meta.url),
	'utf8',
);
const feedShell = readFileSync(new URL('../components/FeedShell.svelte', import.meta.url), 'utf8');
const chatBubble = readFileSync(
	new URL('../components/ChatBubble.svelte', import.meta.url),
	'utf8',
);
const topPage = readFileSync(new URL('../../routes/+page.svelte', import.meta.url), 'utf8');
const feedRoute = readFileSync(new URL('../../routes/feed/+page.svelte', import.meta.url), 'utf8');
const feedHome = readFileSync(new URL('../components/FeedHome.svelte', import.meta.url), 'utf8');
const landing = readFileSync(
	new URL('../components/landing/Landing.svelte', import.meta.url),
	'utf8',
);
const joinFinale = readFileSync(
	new URL('../components/JoinFinale.svelte', import.meta.url),
	'utf8',
);
const aboutPage = readFileSync(new URL('../../routes/about/+page.svelte', import.meta.url), 'utf8');
const loginPage = readFileSync(new URL('../../routes/login/+page.svelte', import.meta.url), 'utf8');
const guestHero = readFileSync(new URL('../components/GuestHero.svelte', import.meta.url), 'utf8');
const blogList = readFileSync(new URL('../../routes/blog/+page.svelte', import.meta.url), 'utf8');
const newsList = readFileSync(new URL('../../routes/news/+page.svelte', import.meta.url), 'utf8');
const blogArticle = readFileSync(
	new URL('../../routes/blog/[did]/[rkey]/+page.svelte', import.meta.url),
	'utf8',
);
const newsArticle = readFileSync(
	new URL('../../routes/news/[rkey]/+page.svelte', import.meta.url),
	'utf8',
);
const feedPage = readFileSync(
	new URL('../components/FeedTabsView.svelte', import.meta.url),
	'utf8',
);

describe('guest post privacy boundary', () => {
	it('uses only dedicated unauthenticated affirmation procedures', () => {
		expect(api).toMatch(/createGuestAffirmation[\s\S]*?'none'/);
		expect(api).toMatch(/getGuestAffirmation[\s\S]*?'none'/);
		expect(store).not.toMatch(/createPost|createKossoriPost/);
	});

	it('renders the local author through the non-profile ChatBubble variant', () => {
		expect(section).toContain('localGuest={true}');
		expect(section).toContain('uri: `local://');
		expect(chatBubble).toContain('localGuest || $session?.did === post.author.did');
		expect(chatBubble).not.toContain('guest-local-badge');
	});

	it('shares the signed-in modal frame and editor without enabling identity features', () => {
		expect(signedInModal).toContain("from './PostModalShell.svelte'");
		expect(guestModal).toContain("from './PostModalShell.svelte'");
		expect(guestModal).toContain("from './ComposerEditor.svelte'");
		expect(guestModal).toContain('mentionSuggestionsEnabled={false}');
	});

	it('requires both text and age consent and renders the missing-requirements state', () => {
		expect(guestModal).toContain(
			'const canSubmit = $derived(Boolean(text.trim()) && agreed && graphemes <= 3_000);',
		);
		expect(guestModal).toContain('if (busy || !canSubmit) return;');
		expect(guestModal).toContain('disabled={busy || !canSubmit}');
		// 条件が揃うまでは送信ボタンを控えめな見た目にして、押せない理由が伝わるようにする。
		expect(guestModal).toContain("variant={!busy && !canSubmit ? 'secondary' : 'primary'}");
	});

	it('shows the standard post-created notice and links it to the local post in the feed', () => {
		expect(guestModal).toContain('postFollowNotice.show(`/#guest-post-${id}`)');
		expect(section).toContain('id={`guest-post-${entry.id}`}');
		expect(feedPage).not.toContain('GuestPostSection');
		expect(feedShell).toContain('<GuestPostSection botActor={feed.botActor} />');
		expect(feedShell.indexOf('class="welcome"')).toBeLessThan(
			feedShell.indexOf('<GuestPostSection botActor={feed.botActor} />'),
		);
		expect(feedShell.indexOf('<GuestPostSection botActor={feed.botActor} />')).toBeLessThan(
			feedShell.indexOf('<section class="timeline"'),
		);
		expect(topPage).not.toContain('GuestPostSection');
	});

	it('uses only a device-storage label above otherwise unframed local bubbles', () => {
		expect(section).toContain('{m.guestPostStoredOnDevice()}');
		expect(section).not.toContain('guestPostsSectionTitle');
		expect(section).not.toMatch(/\.guest-feed\s*\{[^}]*border:/s);
		expect(section).toContain('padding: 12px;');
		expect(section).not.toContain('margin-left: 32px');
		expect(section).toContain('author: reply ? (botActor ?? fallbackBot) : localActor');
	});

	it('uses one text link for the shared sign-in and start entry point', () => {
		expect(accountCard).toContain('<a href="/login">{m.loginOrStart()}</a>');
		expect(section).toContain('<a href="/login">{m.loginOrStart()}</a>');
		expect(accountCard).not.toContain('/login#signup');
		expect(section).not.toContain('/login#signup');
		expect(accountCard).not.toContain('{m.loginHint()}');
	});

	it('shows the landing on the signed-out top and keeps the feed at /feed', () => {
		// 未サインインの TOP はランディング、サインイン済みはフィード。
		expect(topPage).toMatch(/\{#if \$session\}\s*<FeedHome \/>\s*\{:else\}\s*<Landing \/>/);
		expect(feedRoute).toContain('<FeedHome />');
		// フィードは見出し → タブ。ゲスト投稿は FeedShell の中にだけ出る。
		expect(feedHome.indexOf('<PageHeader')).toBeLessThan(feedHome.indexOf('<FeedTabsView'));
		expect(feedHome).not.toContain('GuestHero');
		expect(feedHome).not.toContain('GuestPostSection');
		expect(landing).not.toContain('GuestPostSection');
		expect(loginPage).toContain('<a href="/feed">{m.loginBrowse()}</a>');
		expect(feedShell).not.toContain('<GuestHero');
		expect(feedShell).not.toContain('{m.heroTitle()}');
	});

	it('puts join links at the top and bottom of the landing', () => {
		expect(landing).toContain('href="/login#signup">{m.aboutHeroCta()}</Button>');
		// 末尾は /about と同じ参加の締めを使う。
		expect(landing).toContain('<JoinFinale ');
		expect(joinFinale).toContain('href="/login#signup"');
		expect(aboutPage).toContain('<JoinFinale />');
		expect(landing.indexOf('class="landing-hero"')).toBeLessThan(landing.indexOf('<JoinFinale'));
		expect(landing).toContain('href="/feed"');
	});

	it('keeps the guest hero copy with its about and join links', () => {
		expect(guestHero).toContain('{m.heroTitle()}');
		expect(guestHero).toMatch(/class="hero-about" href="\/about"\s*>\{m\.welcomeAboutLink\(\)\}/);
		expect(guestHero).toContain('class="hero-join" href="/login">{m.joinCta()}</Button>');
	});

	it('puts the guest hero above blog and news articles, not on their list pages', () => {
		for (const [page, article] of [
			[blogArticle, '<article class="blog-article">'],
			[newsArticle, '<article class="news-permalink">'],
		]) {
			expect(page).toContain('const showHero = $derived(!$session);');
			expect(page.indexOf('<GuestHero />')).toBeGreaterThan(-1);
			expect(page.indexOf('<GuestHero />')).toBeLessThan(page.indexOf(article));
		}
		expect(blogList).not.toContain('GuestHero');
		expect(newsList).not.toContain('GuestHero');
	});
});
