import { describe, expect, it } from 'vitest';
import {
	BLUESKY_VIEW_SCOPES,
	buildScope,
	CROSSPOST_SCOPE,
	STANDARD_SITE_COLLECTION_SCOPES,
	TRILINES_COLLECTION_SCOPE,
} from './client';

describe('buildScope', () => {
	it('does not request Bluesky profile write permissions', () => {
		expect(
			buildScope({ crosspost: true })
				.split(' ')
				.some((scope) => scope.startsWith('repo:app.bsky.actor.profile')),
		).toBe(false);
	});
	it('always includes the 3 Lines diary collection and its assist RPC', () => {
		const base = buildScope().split(' ');
		expect(TRILINES_COLLECTION_SCOPE).toBe('repo:com.suibari.trilinesat.diary');
		expect(base).toContain(TRILINES_COLLECTION_SCOPE);
		expect(base).toContain('rpc:com.suibari.nagi.generateTrilinesAssist?aud=*');
	});

	it('always includes standard.site and keeps Bluesky crossposting optional', () => {
		const base = buildScope().split(' ');
		for (const scope of STANDARD_SITE_COLLECTION_SCOPES) {
			expect(base.filter((value) => value === scope)).toHaveLength(1);
		}
		expect(base).not.toContain(CROSSPOST_SCOPE);
		expect(buildScope({ crosspost: true }).split(' ')).toContain(CROSSPOST_SCOPE);
	});

	it('requests the Bluesky feed reading scopes together with crossposting', () => {
		const base = buildScope().split(' ');
		const linked = buildScope({ crosspost: true }).split(' ');
		for (const scope of BLUESKY_VIEW_SCOPES) {
			expect(base).not.toContain(scope);
			expect(linked.filter((value) => value === scope)).toHaveLength(1);
		}
	});
});
