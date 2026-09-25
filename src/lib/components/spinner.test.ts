import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { clearLocalePreference, setLocalePreference } from '$lib/i18n/i18n.svelte';
import Spinner from './Spinner.svelte';

afterEach(() => clearLocalePreference());

describe('Spinner', () => {
	it('announces the default loading label as a status', () => {
		const { body } = render(Spinner);
		expect(body).toContain('role="status"');
		expect(body).toContain('aria-label="読み込み中…"');
	});

	it('uses the current locale for the default label', () => {
		setLocalePreference('en');
		const { body } = render(Spinner);
		expect(body).toContain('aria-label="Loading…"');
	});

	it('prefers an explicit label', () => {
		const { body } = render(Spinner, { props: { label: 'Uploading' } });
		expect(body).toContain('aria-label="Uploading"');
	});

	it('hides a decorative spinner from assistive technology', () => {
		const { body } = render(Spinner, { props: { decorative: true } });
		expect(body).not.toContain('role="status"');
		expect(body).not.toContain('aria-label=');
		expect(body).toMatch(/class="loading-indicator[^"]*"[^>]*aria-hidden="true"/);
	});

	it('applies size and inline variants', () => {
		const { body } = render(Spinner, { props: { size: 'sm', inline: true } });
		expect(body).toMatch(/class="loading-indicator[^"]*\binline\b/);
		expect(body).toMatch(/class="ring[^"]*\bsmall\b/);
	});
});
