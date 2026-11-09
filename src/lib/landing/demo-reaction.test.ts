import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const demo = read('../components/DemoReactionButton.svelte');
const moment = read('../components/MomentSample.svelte');
const live = read('../components/landing/LandingLivePosts.svelte');

describe('demo reactions', () => {
	it('only plays the stamp effect and never writes anywhere', () => {
		expect(demo).toContain("import ReactionStamp from './ReactionStamp.svelte';");
		expect(demo).not.toMatch(/\$lib\/api\/appview|\$lib\/atproto\/records|createReaction|fetch\(/);
	});

	it('is used by the sample moment and the landing posts instead of the real reaction bar', () => {
		expect(moment).toContain('<DemoReactionButton {emoji} />');
		expect(live).toContain('<DemoReactionButton');
		expect(live).not.toContain('ReactionBar');
	});
});
