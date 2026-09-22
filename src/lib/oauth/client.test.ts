import { describe, expect, it } from 'vitest';
import {
	buildScope,
	CROSSPOST_SCOPE,
	STANDARD_SITE_COLLECTION_SCOPES,
} from './client';

describe('buildScope', () => {
	it('always includes standard.site and keeps Bluesky crossposting optional', () => {
		const base = buildScope().split(' ');
		for (const scope of STANDARD_SITE_COLLECTION_SCOPES) {
			expect(base.filter((value) => value === scope)).toHaveLength(1);
		}
		expect(base).not.toContain(CROSSPOST_SCOPE);
		expect(buildScope({ crosspost: true }).split(' ')).toContain(CROSSPOST_SCOPE);
	});
});
