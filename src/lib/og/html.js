const DID_PATTERN = /^did:[a-z0-9]+:[A-Za-z0-9._:%-]+$/;
export function isSafeDid(value) {
    return typeof value === 'string' && value.length <= 256 && DID_PATTERN.test(value);
}
const escapeAttribute = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
function replaceMeta(html, selector, key, content) {
    const pattern = new RegExp(`<meta\\s+${selector}=["']${key.replace(':', '\\:')}["']\\s+content=["'][^"']*["']\\s*/?>`, 'i');
    const meta = `<meta ${selector}="${key}" content="${escapeAttribute(content)}" />`;
    return pattern.test(html)
        ? html.replace(pattern, meta)
        : html.replace('</head>', `\t\t${meta}\n\t</head>`);
}
/**
 * adapter-static が作った SPA shell は全URLで同一なので、動的ページだけ画像メタを差し替える。
 * script を足さないため、SvelteKit が生成した CSP hash は変更不要。
 */
export function withProfileCardMeta(html, did) {
    // v2 は WebP アバターを直接埋め込んでいた旧画像の長期キャッシュを回避する。
    const image = `https://nagi.suibari.com/api/profile-card?v=2&did=${encodeURIComponent(did)}`;
    const alt = 'Nagiのプロフィールカード';
    let output = replaceMeta(html, 'property', 'og:image', image);
    output = replaceMeta(output, 'property', 'og:image:type', 'image/png');
    output = replaceMeta(output, 'property', 'og:image:alt', alt);
    output = replaceMeta(output, 'name', 'twitter:image', image);
    return replaceMeta(output, 'name', 'twitter:image:alt', alt);
}
