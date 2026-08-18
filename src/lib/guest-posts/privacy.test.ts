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
const myNagiPage = readFileSync(new URL('../../routes/+page.svelte', import.meta.url), 'utf8');
const feedPage = readFileSync(new URL('../../routes/feed/+page.svelte', import.meta.url), 'utf8');

describe('guest post privacy boundary', () => {
	it('uses only dedicated unauthenticated affirmation procedures', () => {
		expect(api).toMatch(/createGuestAffirmation[\s\S]*?'none'/);
		expect(api).toMatch(/getGuestAffirmation[\s\S]*?'none'/);
		expect(store).not.toMatch(/createPost|createKossoriPost|getCommunityAffirmations/);
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
		expect(guestModal).toContain('channelSuggestionsEnabled={false}');
	});

	it('requires both text and age consent and renders the missing-requirements state', () => {
		expect(guestModal).toContain(
			'const canSubmit = $derived(Boolean(text.trim()) && agreed && graphemes <= 3_000);',
		);
		expect(guestModal).toContain('if (busy || !canSubmit) return;');
		expect(guestModal).toContain('disabled={busy || !canSubmit}');
		expect(guestModal).toContain('class:requirements-missing={!busy && !canSubmit}');
	});

	it('shows the standard post-created notice and links it to the local post in the feed', () => {
		expect(guestModal).toContain('postFollowNotice.show(`/feed#guest-post-${id}`)');
		expect(section).toContain('id={`guest-post-${entry.id}`}');
		expect(feedPage).not.toContain('GuestPostSection');
		expect(feedShell).toContain('<GuestPostSection botActor={feed.botActor} />');
		expect(feedShell.indexOf('class="welcome"')).toBeLessThan(
			feedShell.indexOf('<GuestPostSection botActor={feed.botActor} />'),
		);
		expect(feedShell.indexOf('<GuestPostSection botActor={feed.botActor} />')).toBeLessThan(
			feedShell.indexOf('<section class="timeline"'),
		);
		expect(myNagiPage).not.toContain('GuestPostSection');
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

	it('shows the guest hero below the my Nagi header and above the bot section', () => {
		expect(myNagiPage).toContain('<section class="hero">');
		expect(myNagiPage).toContain('{m.heroTitle()}');
		expect(myNagiPage).toContain('<a class="hero-about" href="/about">{m.welcomeAboutLink()}</a>');
		expect(myNagiPage).toContain('<a class="hero-join" href="/login">{m.joinCta()}</a>');
		expect(myNagiPage.indexOf('class="my-nagi-heading"')).toBeLessThan(
			myNagiPage.indexOf('<section class="hero">'),
		);
		expect(myNagiPage.indexOf('<section class="hero">')).toBeLessThan(
			myNagiPage.indexOf('title={m.myNagiBotTitle()}'),
		);
		expect(feedShell).not.toContain('<section class="hero">');
		expect(feedShell).not.toContain('{m.heroTitle()}');
	});
});
