/**
 * 利用規約・プライバシーポリシーの最終更新日。
 * 4ファイル（Terms/Privacy の ja/en）に同じ日付を散らすと必ずずれるので1箇所に置く。
 * 本文を実質的に変更したときだけ更新すること。static/sitemap.xml の lastmod も合わせる。
 */
export const LEGAL_LAST_UPDATED = '2026-09-02';

const [year, month, day] = LEGAL_LAST_UPDATED.split('-').map(Number);

export const LEGAL_LAST_UPDATED_JA = `${year}年${month}月${day}日`;
export const LEGAL_LAST_UPDATED_EN = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
	'en-US',
	{ year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' },
);

/** 連絡先。規約・ポリシー・通報導線から参照する。 */
export const CONTACT_EMAIL = 'contact@suibari.com';
export const CONTACT_SITE = 'https://suibari.com';
