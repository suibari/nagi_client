const DID_PATTERN = /^did:[a-z0-9]+:[A-Za-z0-9._:%-]+$/;

export function isSafeDid(value: unknown): value is string {
	return typeof value === 'string' && value.length <= 256 && DID_PATTERN.test(value);
}

const escapeAttribute = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');

function replaceMeta(html: string, selector: 'property' | 'name', key: string, content: string) {
	const pattern = new RegExp(
		`<meta\\s+${selector}=["']${key.replace(':', '\\:')}["']\\s+content=["'][^"']*["']\\s*/?>`,
		'i',
	);
	const meta = `<meta ${selector}="${key}" content="${escapeAttribute(content)}" />`;
	return pattern.test(html)
		? html.replace(pattern, meta)
		: html.replace('</head>', `\t\t${meta}\n\t</head>`);
}

/**
 * adapter-static が作った SPA shell は全URLで同一なので、動的ページだけ画像メタを差し替える。
 * script を足さないため、SvelteKit が生成した CSP hash は変更不要。
 */
export function withProfileCardMeta(html: string, did: string) {
	const image = `https://nagi.suibari.com/api/profile-card?did=${encodeURIComponent(did)}`;
	const alt = 'Nagiのプロフィールカード';
	let output = replaceMeta(html, 'property', 'og:image', image);
	output = replaceMeta(output, 'property', 'og:image:type', 'image/png');
	output = replaceMeta(output, 'property', 'og:image:alt', alt);
	output = replaceMeta(output, 'name', 'twitter:image', image);
	return replaceMeta(output, 'name', 'twitter:image:alt', alt);
}
